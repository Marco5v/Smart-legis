import React from 'react';
import Clock from './Clock';

const OffPanel: React.FC = React.memo(() => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-sapv-blue-dark">
       <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex flex-col items-center justify-center gap-6" aria-label="Smart Legis Branding">
            <img src="https://picsum.photos/seed/brasao/120" alt="Brasão do Município" className="h-28" />
             <svg
              className="w-48 h-48"
              viewBox="0 0 65 65"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="logoGradient" x1="50%" y1="0%" x2="50%" y2="100%">
                  <stop offset="0%" stopColor="#64ffda" />
                  <stop offset="100%" stopColor="#00abe4" />
                </linearGradient>
              </defs>
              <path
                d="M49.4 56.5C47.9 56.5 46.7 55.3 46.7 53.8V9.2C46.7 7.7 47.9 6.5 49.4 6.5H51.9C53.4 6.5 54.6 7.7 54.6 9.2V46.7C54.6 48.2 53.4 49.4 51.9 49.4H10.1C8.6 49.4 7.4 48.2 7.4 46.7V9.2C7.4 7.7 8.6 6.5 10.1 6.5H29.2M31.3 49.4C31.3 49.4 30.1 56.5 26.3 56.5C22.5 56.5 21.4 49.4 21.4 49.4"
                stroke="url(#logoGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M19.1 26.5L30 37.4L58.2 8.5"
                stroke="url(#logoGradient)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-8xl font-black text-white font-sans tracking-tight">
              SMART LEGIS
            </h1>
          </div>
        </div>
      <h2 className="text-4xl text-sapv-gray-light mb-12">
        CÂMARA MUNICIPAL DE EXEMPLO
      </h2>
      <Clock className="text-8xl font-bold" />
    </div>
  );
});

export default OffPanel;