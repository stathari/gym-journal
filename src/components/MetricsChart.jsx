import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';
import { format, parseISO } from 'date-fns';

const MetricsChart = ({ data = [] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="card h-full flex items-center justify-center">
                <p className="text-text-secondary">No data available yet</p>
            </div>
        );
    }

    // Format date for display
    const chartData = data.map(item => ({
        ...item,
        displayDate: format(parseISO(item.date), 'MMM d'),
    }));

    return (
        <div className="card h-full p-4">
            <h3 className="text-lg font-semibold mb-4 text-center">Health Metrics</h3>
            <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                        data={chartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis
                            dataKey="displayDate"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                        />
                        <YAxis
                            yAxisId="left"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            label={{ value: 'Weight', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                            domain={['auto', 'auto']}
                        />
                        <YAxis
                            yAxisId="right"
                            orientation="right"
                            stroke="#94a3b8"
                            tick={{ fill: '#94a3b8' }}
                            label={{ value: 'BMI', angle: 90, position: 'insideRight', fill: '#94a3b8' }}
                            domain={['auto', 'auto']}
                        />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1e293b', border: 'none', color: '#f8fafc' }}
                        />
                        <Legend />
                        <Line
                            yAxisId="left"
                            type="monotone"
                            dataKey="weight"
                            stroke="#3b82f6"
                            activeDot={{ r: 8 }}
                            name="Weight (kg/lbs)"
                        />
                        <Line
                            yAxisId="right"
                            type="monotone"
                            dataKey="bmi"
                            stroke="#22c55e"
                            name="BMI"
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default MetricsChart;
