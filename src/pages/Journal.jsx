import React, { useState } from 'react';
import JournalForm from '../components/JournalForm';
import { appendData } from '../services/googleSheets';

const Journal = ({ user }) => {
    const [saving, setSaving] = useState(false);

    const handleSave = async (data) => {
        if (!user) {
            alert("Please sign in first.");
            return;
        }

        setSaving(true);
        try {
            // Save sequentially or parallel
            // We have 3 types: workout, metrics, journal
            const promises = [];

            if (data.exercises.some(ex => ex.name)) {
                promises.push(appendData('workout', data));
            }

            if (data.metrics.weight || data.metrics.bmi) {
                promises.push(appendData('metrics', data));
            }

            if (data.dailyNotes) {
                promises.push(appendData('journal', data));
            }

            await Promise.all(promises);

            alert('Entry saved successfully!');
        } catch (error) {
            console.error("Error saving data", error);
            alert('Failed to save data. Check console.');
        } finally {
            setSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
                <p className="text-text-secondary">Connect with Google to log your journal.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Daily Journal</h1>
                <p className="text-text-secondary">Log your workouts, metrics, and thoughts.</p>
            </header>

            {saving ? (
                <div className="card p-8 text-center">
                    <p>Saving to Google Sheets...</p>
                </div>
            ) : (
                <JournalForm onSubmit={handleSave} />
            )}
        </div>
    );
};

export default Journal;
