import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ChartComponent = ({ data, dataKey, title, type = "line" }) => {
  // Validate data and dataKey
  if (!Array.isArray(data)) {
    console.error("Invalid data: Expected an array of objects.");
    return (
      <div className="chart-container">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-red-500">Invalid data provided for the chart.</p>
      </div>
    );
  }

  if (!dataKey || typeof dataKey !== "string") {
    console.error("Invalid dataKey: Expected a string.");
    return (
      <div className="chart-container">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-red-500">Invalid dataKey provided for the chart.</p>
      </div>
    );
  }

  // Check if dataKey exists in the first data object
  if (data.length > 0 && !data[0].hasOwnProperty(dataKey)) {
    console.error(`Invalid dataKey: '${dataKey}' not found in data.`);
    return (
      <div className="chart-container">
        <h2 className="text-xl font-semibold mb-4">{title}</h2>
        <p className="text-red-500">{`Key '${dataKey}' not found in data.`}</p>
      </div>
    );
  }

  return (
    <div className="chart-container bg-white p-4 rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4 text-center">{title}</h2>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          {type === "line" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey={dataKey}
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          ) : (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={dataKey} fill="#82ca9d" />
            </BarChart>
          )}
        </ResponsiveContainer>
      ) : (
        <p className="text-gray-500 text-center">No data available for visualization.</p>
      )}
    </div>
  );
};

export default ChartComponent;