import React, { useEffect, useState } from 'react';
import AttendanceCalendar from '../components/AttendanceCalendar';
import MetricsChart from '../components/MetricsChart';
import { fetchData } from '../services/googleSheets';

const Dashboard = ({ user }) => {
    const [workouts, setWorkouts] = useState([]);
    const [metrics, setMetrics] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            loadData();
        }
    }, [user]);

    const loadData = async () => {
        setLoading(true);
        const data = await fetchData();
        setWorkouts(data.workouts);
        // Sort metrics by date
        const sortedMetrics = data.metrics.sort((a, b) => new Date(a.date) - new Date(b.date));
        setMetrics(sortedMetrics);
        setLoading(false);
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-center">
                <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
                <p className="text-text-secondary">Connect with Google to view your dashboard.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
                    <p className="text-text-secondary">Welcome back, {user.name}!</p>
                </div>
                <button onClick={loadData} className="btn text-sm" disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Data'}
                </button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96">
                    <AttendanceCalendar workouts={workouts} />
                </div>
                <div className="h-96">
                    <MetricsChart data={metrics} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
