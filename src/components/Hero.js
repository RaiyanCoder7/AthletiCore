import React from "react";

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-20 text-center">
      <div className="container mx-auto" style={{ marginTop: '50px' }}> {/* Inline style to move down */}
        <h1 className="text-4xl font-bold mb-4">Revolutionizing Athlete Management</h1>
        <p className="text-lg mb-8">
          Empowering athletes and teams with advanced tools for success in the sporting industry.
        </p>
        <a href="/SignUp" className="mt-4 px-6 py-2 bg-white text-blue-500 rounded-lg hover:bg-gray-200 text-lg font-semibold no-underline">
          Get Started
        </a>
      </div>
    </section>
  );
};

export default Hero;