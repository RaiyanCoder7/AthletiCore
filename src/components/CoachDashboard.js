import React, { useState, useEffect } from 'react'; 
import { db } from '../services/firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, getDoc, arrayUnion } from 'firebase/firestore';
import { FaEdit, FaTrash } from 'react-icons/fa';

const CoachDashboard = () => {
  const [athletes, setAthletes] = useState([]);
  const [newAthlete, setNewAthlete] = useState({
    name: '', email: '', age: '', sport: '', matchesPlayed: '', goalsScored: '', assists: '', fitnessLevel: '', injuryHistory: ''
  });
  const [editingAthlete, setEditingAthlete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selectedSport, setSelectedSport] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'athletes'), (snapshot) => {
      const athleteList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAthletes(athleteList);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setNewAthlete({ ...newAthlete, [e.target.name]: e.target.value });
  };

  const handleEdit = (athlete) => {
    setEditingAthlete(athlete);
    const { id, ...athleteData } = athlete;
    setNewAthlete(athleteData);
  };

  const handleSaveAthlete = async () => {
    // Validate required fields
    if (!newAthlete.name.trim()) {
      alert("Please enter the athlete's name.");
      return;
    }
    if (!newAthlete.age.trim() || isNaN(newAthlete.age) || newAthlete.age <= 0) {
      alert("Please enter a valid age (positive number).");
      return;
    }
    if (!newAthlete.email.trim() || !/^[\w.-]+@([\w-]+\.)+[\w-]{2,4}$/.test(newAthlete.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!newAthlete.sport.trim()) {
      alert("Please enter the sport.");
      return;
    }
    if (!newAthlete.matchesPlayed.trim() || isNaN(newAthlete.matchesPlayed) || newAthlete.matchesPlayed < 0) {
      alert("Please enter a valid number of matches played (0 or greater).");
      return;
    }
  
    try {
      if (editingAthlete) {
        const athleteRef = doc(db, 'athletes', editingAthlete.id);
        const athleteDoc = await getDoc(athleteRef);
  
        if (athleteDoc.exists()) {
          const currentData = athleteDoc.data();
          const todayDate = new Date().toISOString().split("T")[0];
  
          await updateDoc(athleteRef, {
            ...newAthlete,
            fitnessHistory: arrayUnion({
              date: todayDate,
              level: currentData.fitnessLevel
            })
          });
        }
        setEditingAthlete(null);
      } else {
        await addDoc(collection(db, 'athletes'), {
          ...newAthlete,
          fitnessHistory: []
        });
      }
  
      setNewAthlete({
        name: '', email: '', age: '', sport: '', matchesPlayed: '', goalsScored: '', assists: '', fitnessLevel: '', injuryHistory: ''
      });
  
    } catch (error) {
      console.error("Error saving athlete:", error);
    }
  };   

  const handleDeleteAthlete = async (id) => {
    await deleteDoc(doc(db, 'athletes', id));
  };

  const handleSort = (field) => {
    const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortOrder(newSortOrder);
  };

  const sortedAthletes = [...athletes].sort((a, b) => {
    if (a[sortField] < b[sortField]) return sortOrder === 'asc' ? -1 : 1;
    if (a[sortField] > b[sortField]) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredAthletes = selectedSport
    ? sortedAthletes.filter(athlete => athlete.sport.toLowerCase() === selectedSport.toLowerCase())
    : sortedAthletes;

  const uniqueSports = [...new Set(athletes.map(athlete => athlete.sport))];

  const athleteFields = ['name', 'email', 'age', 'sport', 'matchesPlayed', 'goalsScored', 'assists', 'fitnessLevel', 'injuryHistory', 'fitnessHistory'];

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white shadow-lg rounded-lg">
      <h1 className="text-center text-3xl font-bold mb-6">Coach Dashboard</h1>

      <input 
        type="text" 
        placeholder="Search athletes..." 
        value={searchTerm} 
        onChange={(e) => setSearchTerm(e.target.value)} 
        className="border p-2 rounded w-full mb-4" 
      />

      <div className="mb-4">
        <select 
          value={selectedSport} 
          onChange={(e) => setSelectedSport(e.target.value)} 
          className="border p-2 rounded w-full"
        >
          <option value="">All Sports</option>
          {uniqueSports.map((sport) => (
            <option key={sport} value={sport}>{sport}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {athleteFields.map((key) => (
          <input key={key} type="text" name={key} placeholder={key.charAt(0).toUpperCase() + key.slice(1)} value={newAthlete[key] || ''} onChange={handleChange} className="border p-2 rounded w-full" />
        ))}
      </div>

      <button 
        onClick={handleSaveAthlete} 
        className="w-full py-2 text-white font-semibold rounded-lg transition-all duration-300 shadow-md 
                   bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 hover:shadow-lg">
        {editingAthlete ? "Update Athlete" : "Add Athlete"}
      </button>

      <div className="overflow-x-auto mt-4">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              {athleteFields.map((field) => (
                <th key={field} className="p-3 text-center border border-gray-200 cursor-pointer" onClick={() => handleSort(field)}>
                  {field.charAt(0).toUpperCase() + field.slice(1)} {sortField === field ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                </th>
              ))}
              <th className="p-3 text-center border border-gray-200 w-24">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAthletes.map((athlete) => (
              <tr key={athlete.id} className="hover:bg-gray-50">
                {athleteFields.map((key) => (
                  <td key={key} className="p-3 text-center border border-gray-200">
                    {key === "fitnessHistory"
                      ? (
                        <ul className="text-sm">
                          {athlete.fitnessHistory && athlete.fitnessHistory.length > 0 ? (
                            athlete.fitnessHistory.map((entry, index) => (
                              <li key={index}>{entry.date}: {entry.level}</li>
                            ))
                          ) : "No History"}
                        </ul>
                      )
                      : typeof athlete[key] === 'object' 
                        ? JSON.stringify(athlete[key]) 
                        : athlete[key]

                    }
                  </td>
                ))}
                <td className="p-3 text-center border border-gray-200 w-24 flex justify-center space-x-2">
                  <button onClick={() => handleEdit(athlete)} className="text-blue-500 p-1">
                    <FaEdit />
                  </button>
                  <button onClick={() => handleDeleteAthlete(athlete.id)} className="text-red-500 p-1">
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CoachDashboard;