import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/connecta-logo.svg';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center">
        <img src={logo} alt="Connecta" className="w-28 h-28 mx-auto" />
        <h1 className="mt-6 text-4xl font-extrabold text-white drop-shadow">Connecta</h1>
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="mt-8 bg-primary-600 text-white px-10 py-3 rounded-2xl font-semibold hover:bg-primary-700 transition-morph"
        >
          Visit
        </button>
      </div>
      <div className="absolute bottom-8 text-center">
        <p className="text-white text-sm opacity-80">
          Powered by <a href="https://d4dx.co" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-100 transition">d4dx.co</a>
        </p>
      </div>
    </div>
  );
};

export default Landing;
