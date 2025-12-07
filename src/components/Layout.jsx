import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';

const Layout = ({ user, onSignIn, onSignOut }) => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path ? 'text-accent-primary' : 'text-text-secondary';
    };

    return (
        <div className="min-h-screen bg-bg-primary text-text-primary">
            <nav className="border-b border-bg-tertiary bg-bg-secondary sticky top-0 z-50">
                <div className="container flex items-center justify-between h-16">
                    <Link to="/" className="text-xl font-bold bg-gradient-to-r from-accent-primary to-accent-secondary bg-clip-text text-transparent">
                        GymJournal
                    </Link>

                    <div className="flex gap-6">
                        <Link to="/" className={`hover:text-text-primary transition-colors ${isActive('/')}`}>
                            Dashboard
                        </Link>
                        <Link to="/journal" className={`hover:text-text-primary transition-colors ${isActive('/journal')}`}>
                            Journal
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium">{user.name}</span>
                                {user.imageUrl && (
                                    <img src={user.imageUrl} alt={user.name} className="w-8 h-8 rounded-full border border-bg-tertiary" />
                                )}
                                <button onClick={onSignOut} className="btn text-sm hover:text-danger">
                                    Sign Out
                                </button>
                            </div>
                        ) : (
                            <button onClick={onSignIn} className="btn btn-primary text-sm">
                                Sign In with Google
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            <main className="container py-8">
                <Outlet context={{ user }} />
            </main>
        </div>
    );
};

export default Layout;
