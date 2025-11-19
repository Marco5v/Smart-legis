import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Tv } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Painel Eletrônico Legislativo</h1>
        <p className="text-lg text-gray-600">Sistema de Apoio ao Plenário e Votação</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
        <Link 
          to="/controller" 
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors duration-300 text-lg"
        >
          <Shield size={24} />
          Painel do Controlador
        </Link>
        <a 
          href="#/panel" 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gray-100 text-black rounded-lg font-semibold hover:bg-gray-200 transition-colors duration-300 border border-gray-200 text-lg"
        >
          <Tv size={24} />
          Abrir Painel Público
        </a>
      </div>
    </div>
  );
};

export default LandingPage;