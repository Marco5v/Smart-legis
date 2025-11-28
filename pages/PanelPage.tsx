
import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionStatus } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';
import VotingPanel from '../components/panel/VotingPanel';
import CouncilMemberCard from '../components/CouncilMemberCard';
import Clock from '../components/panel/Clock';
import { Maximize, Minimize } from 'lucide-react';

const PanelPage: React.FC = () => {
  const { session, councilMembers, legislatureConfig } = useSession();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setCurrentDate(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Erro ao tentar ativar o modo de tela cheia: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  const renderMainPanel = () => {
    // A área principal renderiza o painel dinâmico
    switch (session.panelView) {
      case PanelView.VOTING:
        return <VotingPanel />;
      case PanelView.SPEAKER:
        return <SpeakerPanel 
                  currentSpeaker={session.currentSpeaker}
                  speakerTimerEndTime={session.speakerTimerEndTime}
               />;
      case PanelView.READING:
        return <ReadingPanel
                  project={session.currentProject}
               />;
      case PanelView.MESSAGE:
        return <MessagePanel
                  message={session.panelMessage}
                />;
      // Para PRESENCE, a área principal pode ficar mais limpa, mostrando algo relevante
      // ou apenas o projeto atual, já que a presença está no rodapé.
      case PanelView.PRESENCE:
        return <ReadingPanel project={session.currentProject} />;
      case PanelView.OFF:
      default:
        return <OffPanel />;
    }
  };

  // A tela de espera (OFF) ocupa a tela inteira.
  if (session.panelView === PanelView.OFF || session.status === SessionStatus.INACTIVE) {
      return <OffPanel />;
  }

  const sessionInfo = `5ª Sessão Ordinária - 2024`; // Placeholder

  return (
    <div className="w-screen h-screen overflow-hidden bg-sapv-blue-dark text-sapv-gray-light flex flex-col font-sans relative">
      {/* A. Cabeçalho Fixo */}
      <header className="flex-shrink-0 flex justify-between items-center p-4 border-b-2 border-sapv-gray-dark">
        <div className="flex items-center gap-4">
            <svg className="w-12 h-12" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs><linearGradient id="logoGrad" x1="50%" y1="0%" x2="50%" y2="100%"><stop offset="0%" stopColor="#64ffda" /><stop offset="100%" stopColor="#00abe4" /></linearGradient></defs>
                <path d="M49.4 56.5C47.9 56.5 46.7 55.3 46.7 53.8V9.2C46.7 7.7 47.9 6.5 49.4 6.5H51.9C53.4 6.5 54.6 7.7 54.6 9.2V46.7C54.6 48.2 53.4 49.4 51.9 49.4H10.1C8.6 49.4 7.4 48.2 7.4 46.7V9.2C7.4 7.7 8.6 6.5 10.1 6.5H29.2M31.3 49.4C31.3 49.4 30.1 56.5 26.3 56.5C22.5 56.5 21.4 49.4 21.4 49.4" stroke="url(#logoGrad)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M19.1 26.5L30 37.4L58.2 8.5" stroke="url(#logoGrad)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-2xl font-black tracking-tight">SMART LEGIS</span>
        </div>
        <div className="text-center">
            <h1 className="text-2xl font-bold">{sessionInfo}</h1>
            <p className="text-lg text-sapv-gray">{legislatureConfig.cityName}</p>
        </div>
        <div className="text-right">
            <Clock className="text-4xl font-mono text-sapv-highlight" />
            <p className="text-lg text-sapv-gray">{currentDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</p>
        </div>
        <button 
          onClick={toggleFullscreen} 
          className="absolute top-4 right-4 z-50 p-2 text-sapv-gray-light hover:text-white transition-colors"
          title={isFullscreen ? "Sair da Tela Cheia" : "Entrar em Tela Cheia"}
        >
          {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
        </button>
      </header>
      
      {/* B. Área Principal Dinâmica */}
      <main key={session.panelView} className="flex-grow overflow-hidden panel-fade-in">
        {renderMainPanel()}
      </main>

      {/* C. Grid de Vereadores Fixo */}
      <footer className="flex-shrink-0 p-4 border-t-2 border-sapv-gray-dark bg-sapv-blue-light">
          <div className="grid grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-2">
              {councilMembers.map(member => (
                  <CouncilMemberCard 
                      key={member.uid}
                      member={member}
                      isPresent={session.presence[member.uid] || false}
                      isConfirmedAbsent={session.confirmedAbsence?.[member.uid] || false}
                  />
              ))}
          </div>
      </footer>
    </div>
  );
};

export default PanelPage;
