import React, { useState } from 'react';
import Navbar from '../Navbar/Navbar';
function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  return (
    <>
    <Navbar/>
    <div className="mt-10 max-w-2xl mx-auto p-8 bg-[#07162d] text-white rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold mb-4">Contact Us</h1>
      <p className="mb-8 text-white/90">
        Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div className="flex flex-col gap-2">
          <label htmlFor="name" className="font-medium">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="p-3 rounded-md border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label htmlFor="email" className="font-medium">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="p-3 rounded-md border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Subject */}
        <div className="flex flex-col gap-2">
          <label htmlFor="subject" className="font-medium">Subject</label>
          <input
            type="text"
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            required
            className="p-3 rounded-md border border-gray-300 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Message */}
        <div className="flex flex-col gap-2">
          <label htmlFor="message" className="font-medium">Message</label>
          <textarea
            id="message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows="5"
            className="p-3 rounded-md border border-gray-300 text-black resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Submit */}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-md transition duration-200"
        >
          Send Message
        </button>
      </form>
    </div>
    </>
  );
}

export default Contact;