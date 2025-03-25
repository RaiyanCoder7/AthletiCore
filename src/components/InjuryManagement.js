import React, { useState } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../services/firebase';

const InjuryManagement = ({ athlete, onClose }) => {
  const [injuryType, setInjuryType] = useState('');
  const [injuryStatus, setInjuryStatus] = useState('Ongoing');

  const handleSaveInjury = async () => {
    if (!injuryType.trim()) {
      alert("Please enter an injury type.");
      return;
    }

    try {
      const athleteRef = doc(db, 'athletes', athlete.id);

      await updateDoc(athleteRef, {
        injuryHistory: arrayUnion({ type: injuryType, status: injuryStatus }),
      });

      onClose(); // Close the popup after saving
    } catch (error) {
      console.error("Error updating injury history:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Manage Injury for {athlete.name}</h2>

        <input 
          type="text" 
          placeholder="Injury Type" 
          value={injuryType} 
          onChange={(e) => setInjuryType(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        />

        <select 
          value={injuryStatus} 
          onChange={(e) => setInjuryStatus(e.target.value)}
          className="border p-2 rounded w-full mb-3"
        >
          <option value="Ongoing">Ongoing</option>
          <option value="Recovered">Recovered</option>
        </select>

        <div className="flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-400 text-white rounded-md">
            Cancel
          </button>
          <button onClick={handleSaveInjury} className="px-4 py-2 bg-blue-500 text-white rounded-md">
            Save Injury
          </button>
        </div>
      </div>
    </div>
  );
};

export default InjuryManagement;