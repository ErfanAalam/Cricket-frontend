import React from 'react';
import Navbar from '../Navbar/Navbar';

function About() {
  return (
    <>
    <Navbar/>
    <div className="m-10 max-w-7xl mx-auto p-8 bg-[#07162d] text-white rounded-2xl">
      {/* Header Section */}
      <header className="text-center mb-12 p-10 rounded-xl bg-gradient-to-r from-[#0056b3] to-[#003c7e] shadow-lg">
        <h1 className="text-4xl font-bold mb-4">About Cricket Stats Hub</h1>
        <p className="text-lg max-w-2xl mx-auto text-white/90">
          Your Ultimate Cricket Statistics Destination
        </p>
      </header>

      {/* Mission Section */}
      <section className="bg-[#0b1e39] p-8 rounded-xl border border-[#274c77] shadow-md hover:-translate-y-1 hover:shadow-xl transition duration-300 mb-12">
        <h2 className="text-3xl font-semibold text-center mb-4">Our Mission</h2>
        <p className="text-center text-white/80 max-w-3xl mx-auto leading-relaxed">
          To provide cricket enthusiasts with comprehensive, accurate, and up-to-date
          cricket statistics, making the rich history and exciting present of cricket
          accessible to everyone.
        </p>
      </section>

      {/* Features Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Live Statistics',
            text: 'Real-time updates from matches around the globe.',
          },
          {
            title: 'Player Profiles',
            text: 'Detailed statistics and career insights for your favorite players.',
          },
          {
            title: 'Team Analysis',
            text: 'Comprehensive performance breakdowns for teams across formats.',
          },
          {
            title: 'Historical Data',
            text: 'A rich archive of cricket statistics spanning decades.',
          },
        ].map((feature, index) => (
          <div
            key={index}
            className="bg-[#0b1e39] p-6 rounded-xl border border-[#274c77] shadow-md hover:bg-[#007bff] hover:text-white transition-all duration-300 hover:shadow-xl"
          >
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-sm text-white/80">{feature.text}</p>
          </div>
        ))}
      </section>

      {/* Team Section */}
      <section className="mt-16 text-center bg-gradient-to-r from-[#0056b3] to-[#003c7e] p-10 rounded-xl shadow-lg">
        <h2 className="text-3xl font-semibold mb-4">Our Team</h2>
        <p className="max-w-2xl mx-auto text-white/90 leading-relaxed">
          We are a passionate crew of cricket lovers, statisticians, and developers committed
          to crafting the most reliable and engaging cricket stats experience for fans worldwide.
        </p>
      </section>
    </div>
    </>
  );
}

export default About;