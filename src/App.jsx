import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import { initGoogleClient, handleSignIn, handleSignOut, getUserProfile, checkUserAccess } from './services/googleSheets';

function App() {
    const [user, setUser] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [permissionStatus, setPermissionStatus] = useState('checking'); // checking, granted, denied

    useEffect(() => {
        initGoogleClient(async (isSignedIn) => {
            setIsInitialized(true);
            if (isSignedIn) {
                const profile = getUserProfile();
                // Optimistically set user but keep permission checking
                setUser(profile);

                // Async check against sheet
                try {
                    const hasAccess = await checkUserAccess(profile.email);
                    if (hasAccess) {
                        setPermissionStatus('granted');
                    } else {
                        setPermissionStatus('denied');
                        // Optional: handleSignOut(); // We keep them signed in to show the "Not Allowed" message contextually
                    }
                } catch (error) {
                    console.error("Permission check failed", error);
                    setPermissionStatus('denied');
                }
            } else {
                setUser(null);
                setPermissionStatus('checking');
            }
        });
    }, []);

    const onSignIn = () => {
        handleSignIn();
    };

    const onSignOut = () => {
        handleSignOut();
        setUser(null);
        setPermissionStatus('checking');
    };

    if (!isInitialized) {
        return <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center">Loading...</div>;
    }

    // Access Denied View
    if (user && permissionStatus === 'denied') {
        return (
            <div className="min-h-screen bg-bg-primary text-text-primary flex items-center justify-center p-4">
                <div className="card max-w-md w-full text-center space-y-4">
                    <h1 className="text-2xl font-bold text-danger">Access Denied</h1>
                    <p className="text-text-secondary">
                        Your email <strong>{user.email}</strong> is not authorized to view this Gym Journal.
                    </p>
                    <div className="bg-bg-tertiary p-3 rounded text-sm text-left">
                        <p className="font-semibold mb-1">How to fix:</p>
                        <p>Ask the owner to add your email to the <strong>"AllowedUsers"</strong> tab in the Google Sheet.</p>
                    </div>
                    <button onClick={onSignOut} className="btn btn-primary">
                        Sign Out
                    </button>
                </div>
            </div>
        );
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout user={user} onSignIn={onSignIn} onSignOut={onSignOut} />}>
                    <Route index element={<Dashboard user={user} />} />
                    <Route path="journal" element={<Journal user={user} />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
