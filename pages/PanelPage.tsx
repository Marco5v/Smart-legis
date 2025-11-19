
import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionPhase } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import PresencePanel from '../components/panel/PresencePanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';
import VotingPanel from '../components/panel/VotingPanel';
import { Maximize, Minimize } from 'lucide-react';

const PanelPage: React.FC = () => {
  const { session, councilMembers } = useSession();
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);

  // Sincroniza o estado com o status de tela cheia do navegador (ex: ao pressionar ESC)
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

  const renderPanel = () => {
    // Durante a Ordem do Dia, a votação deve exibir o painel de leitura com os detalhes do projeto e o placar.
    if (session.phase === SessionPhase.ORDEM_DO_DIA && session.currentProject && (session.votingOpen || session.votingResult)) {
        return <ReadingPanel project={session.currentProject} />;
    }
    
    switch (session.panelView) {
      case PanelView.VOTING:
        return <VotingPanel />;
      case PanelView.PRESENCE:
        return <PresencePanel
                  councilMembers={councilMembers}
                  presentMembers={Object.keys(session.presence).filter(id => session.presence[id])}
                  votes={session.votes}
               />;
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
      case PanelView.OFF:
      default:
        return <OffPanel />;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-sapv-blue-dark relative">
      <div key={session.panelView} className="w-full h-full panel-fade-in">
        {renderPanel()}
      </div>
      
      {/* O botão de tela cheia não aparece na tela de espera (OFF) */}
      {session.panelView !== PanelView.OFF && (
        <button 
          onClick={toggleFullscreen} 
          className="absolute top-4 right-4 z-50 p-2 text-sapv-gray-light hover:text-white transition-colors"
          title={isFullscreen ? "Sair da Tela Cheia" : "Entrar em Tela Cheia"}
          aria-label={isFullscreen ? "Sair da Tela Cheia" : "Entrar em Tela Cheia"}
        >
          {isFullscreen ? <Minimize size={28} /> : <Maximize size={28} />}
        </button>
      )}
    </div>
  );
};

export default PanelPage;
