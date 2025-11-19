import React from 'react';

const SplashScreen: React.FC = () => {
  return (
    <div className="splash-screen">
      <div className="splash-icon">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Colunas */}
          <path className="draw-animation" d="M30 80 V 30" stroke="black" strokeWidth="3" strokeLinecap="round" />
          <path className="draw-animation" d="M50 80 V 30" stroke="black" strokeWidth="3" strokeLinecap="round" style={{ animationDelay: '0.5s' }} />
          <path className="draw-animation" d="M70 80 V 30" stroke="black" strokeWidth="3" strokeLinecap="round" style={{ animationDelay: '1s' }} />
          {/* Arco */}
          <path className="draw-animation arc-animation" d="M25 30 Q 50 15, 75 30" stroke="black" strokeWidth="3" strokeLinecap="round" />
        </svg>
         {/* Cidadãos (pontos) */}
        <div className="dot dot1"></div>
        <div className="dot dot2"></div>
        <div className="dot dot3"></div>
      </div>
      <div className="splash-text">
        <h1>Um momento...</h1>
        <p>O sistema está a organizar o processo legislativo.</p>
      </div>
    </div>
  );
};

export default SplashScreen;