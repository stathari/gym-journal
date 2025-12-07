import React, { useState } from 'react';

const JournalForm = ({ onSubmit, initialDate }) => {
    const [date, setDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '' }]);
    const [metrics, setMetrics] = useState({ weight: '', bmi: '' });
    const [dailyNotes, setDailyNotes] = useState('');

    const handleExerciseChange = (index, field, value) => {
        const newExercises = [...exercises];
        newExercises[index][field] = value;
        setExercises(newExercises);
    };

    const addExercise = () => {
        setExercises([...exercises, { name: '', sets: '', reps: '' }]);
    };

    const removeExercise = (index) => {
        if (exercises.length > 1) {
            const newExercises = exercises.filter((_, i) => i !== index);
            setExercises(newExercises);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit({
            date,
            exercises,
            metrics,
            dailyNotes
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {/* Date Selection */}
            <div className="card">
                <label className="block text-sm font-medium text-text-secondary mb-2">Date</label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input max-w-xs"
                    required
                />
            </div>

            {/* Exercises Section */}
            <div className="card">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Workout Log</h3>
                    <button type="button" onClick={addExercise} className="btn btn-primary text-sm">
                        + Add Exercise
                    </button>
                </div>

                <div className="space-y-4">
                    {exercises.map((exercise, index) => (
                        <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                            <div className="flex-1 w-full">
                                <label className="text-xs text-text-secondary mb-1 block">Exercise Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Bench Press"
                                    value={exercise.name}
                                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                                    className="input"
                                    required
                                />
                            </div>
                            <div className="w-full md:w-24">
                                <label className="text-xs text-text-secondary mb-1 block">Sets</label>
                                <input
                                    type="number"
                                    placeholder="3"
                                    value={exercise.sets}
                                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                                    className="input"
                                />
                            </div>
                            <div className="w-full md:w-24">
                                <label className="text-xs text-text-secondary mb-1 block">Reps</label>
                                <input
                                    type="text"
                                    placeholder="10"
                                    value={exercise.reps}
                                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                                    className="input"
                                />
                            </div>
                            {exercises.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeExercise(index)}
                                    className="btn bg-danger text-white hover:bg-red-600 px-3 py-2 md:mb-[1px]"
                                    title="Remove"
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Body Metrics Section */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Body Metrics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Weight (kg/lbs)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={metrics.weight}
                            onChange={(e) => setMetrics({ ...metrics, weight: e.target.value })}
                            className="input"
                            placeholder="0.0"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">BMI</label>
                        <input
                            type="number"
                            step="0.1"
                            value={metrics.bmi}
                            onChange={(e) => setMetrics({ ...metrics, bmi: e.target.value })}
                            className="input"
                            placeholder="0.0"
                        />
                    </div>
                </div>
            </div>

            {/* Daily Notes Section */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Daily Journal</h3>
                <p className="text-sm text-text-secondary mb-2">How do you feel today?</p>
                <textarea
                    value={dailyNotes}
                    onChange={(e) => setDailyNotes(e.target.value)}
                    className="input min-h-[100px]"
                    placeholder="Write your thoughts here..."
                />
            </div>

            <div className="flex justify-end">
                <button type="submit" className="btn btn-primary w-full md:w-auto px-8 py-3 text-lg">
                    Save Entry
                </button>
            </div>
        </form>
    );
};

export default JournalForm;
