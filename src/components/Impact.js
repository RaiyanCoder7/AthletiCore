import React from "react";

const stats = [
  { value: "10K+", label: "Athletes Empowered" },
  { value: "500+", label: "Teams Connected" },
  { value: "98%", label: "Satisfaction Rate" },
];

const Impact = () => {
  return (
    <section id="impact" className="py-16 bg-blue-50 text-center">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">Our Impact</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index}>
              <h3 className="text-4xl font-bold text-blue-600">{stat.value}</h3>
              <p className="text-gray-700">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Impact;