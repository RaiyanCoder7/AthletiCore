import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import ChartComponent from "../components/ChartComponent";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid } from 'recharts';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import { format, subDays } from 'date-fns';

const AthleteDashboard = () => {
  const [athletes, setAthletes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'athletes'), (snapshot) => {
      const athletesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched Athletes:', athletesData); // Log the fetched data
      setAthletes(athletesData);
    });
    return () => unsubscribe();
  }, []);

  const fitnessLevelMap = {
    "Excellent": 4,
    "High": 3,
    "Medium": 2,
    "Low": 1
  };

  // Prepare data for charts
  const chartData = athletes.map(athlete => ({
    name: athlete.name || "Unknown",
    age: athlete.age ? Number(athlete.age) : 1,
    matchesPlayed: athlete.matchesPlayed ? Number(athlete.matchesPlayed) : 0,
    goalsScored: athlete.goalsScored ? Number(athlete.goalsScored) : 0,
    assists: athlete.assists ? Number(athlete.assists) : 0,
    fitnessLevel: fitnessLevelMap[athlete.fitnessLevel] || 1,
  }));

  // Filter valid ages for PieChart
  const pieData = chartData
    .filter(a => a.age > 0)
    .map(a => ({ name: a.name || "Unknown", value: a.age }))
    .filter(entry => entry.value > 0); // Filter out invalid entries

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

  // Calendar Heatmap Data Processing
  const today = new Date();
  const matchData = athletes.flatMap(athlete =>
    (athlete.matchDates || []).map(date => ({
      date,
      count: athlete.matchesPlayed || 0,
    }))
  );

  // Aggregate match count per day
  const heatmapData = matchData.reduce((acc, { date, count }) => {
    const formattedDate = format(new Date(date), 'yyyy-MM-dd');
    acc[formattedDate] = (acc[formattedDate] || 0) + count;
    return acc;
  }, {});

  const heatmapArray = Object.keys(heatmapData)
    .map(date => ({
      date,
      count: heatmapData[date],
    }))
    .filter(entry => entry.date && !isNaN(entry.count)); // Filter out invalid entries

  return (
    <div className="p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <h1 className="text-center text-4xl font-extrabold text-gray-800 mb-8">Athlete Dashboard</h1>

      {/* Search Bar */}
      <div className="flex justify-center mb-8">
        <input
          type="text"
          placeholder="Search athletes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border-2 border-gray-300 p-2 rounded-lg w-full max-w-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Calendar Heatmap Section */}
      <div className="bg-white p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 text-center">Match Frequency Over Time</h2>
        <div className="flex justify-center">
          <CalendarHeatmap
            startDate={subDays(today, 180)}
            endDate={today}
            values={heatmapArray}
            classForValue={value => !value ? 'color-empty' : `color-scale-${Math.min(value.count, 4)}`}
            tooltipDataAttrs={value => value.date ? { 'data-tip': `${value.date}: ${value.count} matches` } : {}}
          />
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ChartComponent data={chartData} dataKey="matchesPlayed" title="Matches Played" type="bar" />
        <ChartComponent data={chartData} dataKey="goalsScored" title="Goals Scored" type="line" />
        <ChartComponent data={chartData} dataKey="assists" title="Assists" type="bar" />
      </div>

      {/* Age Pie Chart & Fitness Bar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Age Distribution - Pie Chart */}
        <div className="chart-container bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">Age Distribution</h2>
          <PieChart width={400} height={300}>
            <Pie data={pieData} cx="50%" cy="50%" outerRadius={120} fill="#8884d8" dataKey="value" label>
              {pieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </div>

        {/* Fitness Level - Bar Chart */}
        <div className="chart-container bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4 text-center">Fitness Level</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={chartData.length * 40 + 50}>
              <BarChart layout="vertical" data={chartData} margin={{ left: 20 }}>
                <XAxis type="number" domain={[0, 4]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="fitnessLevel" fill="#FF8042" barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center">Not enough data for visualization</p>
          )}
        </div>
      </div>

      {/* Athlete Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {athletes
          .filter(a => a.name && a.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((athlete) => {
            console.log('Athlete:', athlete);
            console.log('Email:', athlete.email);
            console.log('Age:', athlete.age);
            console.log('Matches Played:', athlete.matchesPlayed);
            console.log('Goals Scored:', athlete.goalsScored);
            console.log('Assists:', athlete.assists);
            console.log('Fitness Level:', athlete.fitnessLevel);
            console.log('Injury History:', athlete.injuryHistory);

            return (
              <div key={athlete.id} className="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-all">
                <h2 className="text-xl font-semibold text-blue-700">{athlete.name || "Unknown"}</h2>
                <p className="text-gray-700 font-medium">{athlete.sport || "N/A"}</p>
                <div className="mt-4 text-sm text-gray-600">
                  <p><strong>Email:</strong> {athlete.email || "N/A"}</p>
                  <p><strong>Age:</strong> {athlete.age || "N/A"}</p>
                  <p><strong>Matches Played:</strong> {athlete.matchesPlayed || "N/A"}</p>
                  <p><strong>Goals Scored:</strong> {athlete.goalsScored || "N/A"}</p>
                  <p><strong>Assists:</strong> {athlete.assists || "N/A"}</p>
                  <p><strong>Fitness Level:</strong> {athlete.fitnessLevel || "N/A"}</p>
                  <p><strong>Injury History:</strong> {athlete.injuryHistory && Array.isArray(athlete.injuryHistory) ? (
                    athlete.injuryHistory.length > 0 ? (
                      athlete.injuryHistory.map((injury, index) => (
                        typeof injury === 'string' ? injury : JSON.stringify(injury) // Display string or stringify object
                      )).reduce((prev, curr) => [prev, ', ', curr]) // Join with commas
                    ) : "N/A"
                  ) : "N/A"}</p>

                  {/* Display Fitness History */}
                  {athlete.fitnessHistory && athlete.fitnessHistory.length > 0 && (
                    <div className="mt-6 bg-white p-6 rounded-lg shadow-md">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Fitness History</h3>
                      <ResponsiveContainer width="100%" height={280}>
                        <LineChart
                          data={athlete.fitnessHistory
                            .map(entry => ({
                              date: entry.date ? new Date(entry.date).getTime() : null,
                              fitnessValue: fitnessLevelMap[entry.level] || 1
                            }))
                            .filter(entry => entry.date !== null) // Remove invalid dates
                            .sort((a, b) => a.date - b.date)
                          }
                          margin={{ top: 10, left: 20, right: 20, bottom: 50 }}
                        >
                          <XAxis
                            dataKey="date"
                            type="number"
                            scale="time"
                            domain={['dataMin', 'dataMax']}
                            tickFormatter={(date) => format(new Date(date), "dd MMM")}
                            tick={{ fontSize: 14, fill: "#444" }}
                            angle={-30}
                            textAnchor="end"
                            interval="preserveStartEnd"
                          />
                          <YAxis
                            type="number"
                            domain={[1, 4]}
                            ticks={[1, 2, 3, 4]}
                            tickFormatter={(value) => {
                              return Object.values(fitnessLevelMap).includes(value)
                                ? Object.keys(fitnessLevelMap).find(key => fitnessLevelMap[key] === value)
                                : ""; // Hide unexpected numbers
                            }}
                            tick={{ fontSize: 14, fill: "#333" }}
                          />
                          <CartesianGrid strokeDasharray="4 4" opacity={0.5} />
                          <Tooltip
                            formatter={(value) => {
                              return Object.values(fitnessLevelMap).includes(value)
                                ? [Object.keys(fitnessLevelMap).find(key => fitnessLevelMap[key] === value), "Fitness Level"]
                                : ["", ""]; // Hide unexpected numbers
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="fitnessValue"
                            stroke="#1E88E5"
                            strokeWidth={3}
                            dot={{ fill: "#1E88E5", r: 5 }}
                            activeDot={{ r: 7, stroke: "#0D47A1", strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default AthleteDashboard;