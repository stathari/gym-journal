import { gapi } from 'gapi-script';

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const DISCOVERY_DOCS = ["https://sheets.googleapis.com/$discovery/rest?version=v4"];
const SCOPES = "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file";

const SPREADSHEET_TITLE = "GymJournalData";

export const initGoogleClient = (updateSignInStatus) => {
    gapi.load('client:auth2', () => {
        gapi.client.init({
            apiKey: API_KEY,
            clientId: CLIENT_ID,
            discoveryDocs: DISCOVERY_DOCS,
            scope: SCOPES,
        }).then(() => {
            gapi.auth2.getAuthInstance().isSignedIn.listen(updateSignInStatus);
            updateSignInStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        }, (error) => {
            console.error("Error initializing Google Client", error);
        });
    });
};

export const handleSignIn = () => {
    if (gapi.auth2) {
        gapi.auth2.getAuthInstance().signIn();
    }
};

export const handleSignOut = () => {
    if (gapi.auth2) {
        gapi.auth2.getAuthInstance().signOut();
    }
};

export const getUserProfile = () => {
    if (gapi.auth2) {
        const user = gapi.auth2.getAuthInstance().currentUser.get();
        const profile = user.getBasicProfile();
        return {
            name: profile.getName(),
            imageUrl: profile.getImageUrl(),
            email: profile.getEmail()
        };
    }
    return null;
};

// --- Sheet Operations ---

const findSpreadsheet = async () => {
    const response = await gapi.client.drive.files.list({
        q: `name = '${SPREADSHEET_TITLE}' and mimeType = 'application/vnd.google-apps.spreadsheet' and trashed = false`,
        fields: 'files(id, name)',
    });
    const files = response.result.files;
    if (files && files.length > 0) {
        return files[0].id;
    }
    return null;
};

const createSpreadsheet = async () => {
    const resource = {
        properties: { title: SPREADSHEET_TITLE },
        sheets: [
            { properties: { title: 'Workouts' } },
            { properties: { title: 'Metrics' } },
            { properties: { title: 'DailyJournal' } },
            { properties: { title: 'AllowedUsers' } } // New Tab
        ]
    };
    const response = await gapi.client.sheets.spreadsheets.create({
        resource,
    });

    const spreadsheetId = response.result.spreadsheetId;

    // Headers
    await gapi.client.sheets.spreadsheets.values.batchUpdate({
        spreadsheetId,
        resource: {
            valueInputOption: 'USER_ENTERED',
            data: [
                { range: 'Workouts!A1:E1', values: [['Date', 'Exercise', 'Sets', 'Reps', 'Timestamp']] },
                { range: 'Metrics!A1:D1', values: [['Date', 'Weight', 'BMI', 'Timestamp']] },
                { range: 'DailyJournal!A1:C1', values: [['Date', 'Note', 'Timestamp']] },
                { range: 'AllowedUsers!A1:B1', values: [['Email', 'Date Added']] }
            ]
        }
    });

    return spreadsheetId;
};

const getSpreadsheetId = async () => {
    let id = localStorage.getItem('gymJournalSheetId');
    // We should double check if it actually exists in Drive to avoid invalid ID errors
    // but for performance we rely on local storage first.
    // If API calls fail with 404, we should clear it.

    // For this flow, we will do a more robust check on verify
    return id;
};

// Ensure sheet exists and return ID
const ensureSpreadsheetDetails = async () => {
    await gapi.client.load('drive', 'v3');
    let id = await getSpreadsheetId();

    if (!id) {
        id = await findSpreadsheet();
    }

    if (!id) {
        id = await createSpreadsheet();
        // If we created it, we should add the current user (admin) to allowed list immediately
        const user = getUserProfile();
        if (user) {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId: id,
                range: 'AllowedUsers!A:B',
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[user.email, new Date().toISOString()]] }
            });
        }
    }

    localStorage.setItem('gymJournalSheetId', id);
    return id;
};


export const checkUserAccess = async (email) => {
    try {
        const spreadsheetId = await ensureSpreadsheetDetails();

        // Fetch AllowedUsers
        const response = await gapi.client.sheets.spreadsheets.values.get({
            spreadsheetId,
            range: 'AllowedUsers!A2:A',
        });

        const rows = response.result.values;

        // If list is empty (edge case), add current user (bootstrap admin)
        if (!rows || rows.length === 0) {
            await gapi.client.sheets.spreadsheets.values.append({
                spreadsheetId,
                range: 'AllowedUsers!A:B',
                valueInputOption: 'USER_ENTERED',
                resource: { values: [[email, new Date().toISOString()]] }
            });
            return true; // Granted as admin
        }

        // Check if email is in list
        const allowed = rows.some(row => row[0].toLowerCase() === email.toLowerCase());
        return allowed;

    } catch (e) {
        console.error("Error checking access", e);
        // If sheet doesn't exist or error, we might be in a weird state.
        // Assuming network error or no permission.
        return false;
    }
};


export const appendData = async (type, data) => {
    const spreadsheetId = await ensureSpreadsheetDetails();
    const timestamp = new Date().toISOString();
    let range = '';
    let values = [];

    if (type === 'workout') {
        range = 'Workouts!A:E';
        values = data.exercises.map(ex => [data.date, ex.name, ex.sets, ex.reps, timestamp]);
    } else if (type === 'metrics') {
        range = 'Metrics!A:D';
        if (data.metrics.weight || data.metrics.bmi) {
            values = [[data.date, data.metrics.weight, data.metrics.bmi, timestamp]];
        }
    } else if (type === 'journal') {
        range = 'DailyJournal!A:C';
        if (data.dailyNotes) {
            values = [[data.date, data.dailyNotes, timestamp]];
        }
    }

    if (values.length > 0) {
        await gapi.client.sheets.spreadsheets.values.append({
            spreadsheetId,
            range,
            valueInputOption: 'USER_ENTERED',
            resource: { values }
        });
    }
};

export const fetchData = async () => {
    try {
        const spreadsheetId = await ensureSpreadsheetDetails();
        const response = await gapi.client.sheets.spreadsheets.values.batchGet({
            spreadsheetId,
            ranges: ['Workouts!A2:E', 'Metrics!A2:D', 'DailyJournal!A2:C']
        });

        const valueRanges = response.result.valueRanges;

        const workouts = (valueRanges[0].values || []).map(row => ({
            date: row[0],
            exercise: row[1],
            sets: row[2],
            reps: row[3],
            timestamp: row[4]
        }));

        const metrics = (valueRanges[1].values || []).map(row => ({
            date: row[0],
            weight: parseFloat(row[1] || 0),
            bmi: parseFloat(row[2] || 0),
            timestamp: row[3]
        }));

        const journal = (valueRanges[2].values || []).map(row => ({
            date: row[0],
            note: row[1],
            timestamp: row[2]
        }));

        return { workouts, metrics, journal };
    } catch (e) {
        console.error("Error fetching data", e);
        return { workouts: [], metrics: [], journal: [] };
    }
};
