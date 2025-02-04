import React from "react";

const Dashboard = () => {
  return (
    <section className="py-16 bg-blue-50 text-center">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-6">Athlete Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-bold text-blue-600">Speed</h3>
            <p className="text-gray-700">Max: 28 km/h</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-bold text-blue-600">Stamina</h3>
            <p className="text-gray-700">Endurance Level: High</p>
          </div>
          <div className="p-6 bg-white shadow rounded-lg">
            <h3 className="text-xl font-bold text-blue-600">Injuries</h3>
            <p className="text-gray-700">Tracked in Injury Tracker</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;