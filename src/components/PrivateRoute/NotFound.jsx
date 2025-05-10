import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        height: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Segoe UI, sans-serif',
        padding: '20px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '80px', margin: 0, color: '#e74c3c' }}>404</h1>
      <p style={{ fontSize: '24px', color: '#555' }}>Page Not Found</p>
      <p style={{ fontSize: '16px', color: '#888', maxWidth: '400px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <button
        onClick={() => navigate('/')}
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#3498db',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
        }}
      >
        Go Home
      </button>
    </div>
  );
};

export default NotFound;
