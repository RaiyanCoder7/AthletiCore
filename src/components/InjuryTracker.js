import React from 'react';

const InjuryTracker = () => {
    const injuries = [
        { id: 1, athlete: 'John Doe', type: 'Knee Injury', date: '2025-01-20' },
        { id: 2, athlete: 'Jane Smith', type: 'Shoulder Dislocation', date: '2025-01-18' },
    ];

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold">Injury Tracker</h2>
            <ul className="space-y-2">
                {injuries.map((injury) => (
                    <li key={injury.id} className="border-b p-2">
                        <p><strong>Athlete:</strong> {injury.athlete}</p>
                        <p><strong>Type:</strong> {injury.type}</p>
                        <p><strong>Date:</strong> {injury.date}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InjuryTracker;