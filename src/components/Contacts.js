import React from "react";

const Contact = () => {
  return (
    <section id="contact" className="py-16 bg-gray-100 text-center">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8">Contact Us</h2>
        <p className="text-gray-700 mb-8">Have questions? We're here to help.</p>
        <form className="max-w-xl mx-auto">
          <div className="mb-4">
            <input type="text" placeholder="Your Name" className="w-full p-3 border border-gray-300 rounded" />
          </div>
          <div className="mb-4">
            <input type="email" placeholder="Your Email" className="w-full p-3 border border-gray-300 rounded" />
          </div>
          <div className="mb-4">
            <textarea placeholder="Your Message" rows="4" className="w-full p-3 border border-gray-300 rounded"></textarea>
          </div>
          <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow hover:bg-blue-700">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
};

export default Contact;