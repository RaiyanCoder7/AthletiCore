import React from "react";

const features = [
  { 
    title: "Performance Analytics", 
    description: "Track and analyze athlete performance with cutting-edge data visualization tools and metrics dashboards." 
  },
  { 
    title: "AI-Powered Training Recommendations", 
    description: "Get personalized workout and recovery plans generated by Gemini AI based on each athlete's performance data and injury history."
  },
  { 
    title: "Goal Tracking", 
    description: "Set, monitor, and achieve performance goals with smart reminders, progress tracking, and milestone celebrations." 
  }
];

const Features = () => {
  return (
    <section id="features" className="py-16 bg-gray-100 text-center">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-6">
              <h3 className="text-xl font-bold text-blue-600 mb-4">{feature.title}</h3>
              <p className="text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;