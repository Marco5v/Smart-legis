import React from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionStatus } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';
import VotingPanel from '../components/panel/VotingPanel';
import PresencePanel from '../components/panel/PresencePanel';

const PanelPage: React.FC = () => {
  const { session } = useSession();

  // A tela de espera (OFF) ocupa a tela inteira se a sessão estiver inativa.
  if (session.status === SessionStatus.INACTIVE) {
      return <OffPanel />;
  }
  
  const renderPanel = () => {
    switch (session.panelView) {
      case PanelView.VOTING:
        return <VotingPanel />;
      case PanelView.SPEAKER:
        return <SpeakerPanel 
                  currentSpeaker={session.currentSpeaker}
                  speakerTimerEndTime={session.speakerTimerEndTime}
               />;
      case PanelView.READING:
        return <ReadingPanel project={session.currentProject} />;
      case PanelView.MESSAGE:
        return <MessagePanel message={session.panelMessage} />;
      case PanelView.PRESENCE:
      case PanelView.OFF: // Se a sessão estiver ativa, mas a visualização for OFF, o padrão é a presença
      default:
        // As props não são mais necessárias, pois o componente busca seus próprios dados.
        return <PresencePanel />;
    }
  };

  return (
    <div key={session.panelView} className="w-screen h-screen overflow-hidden bg-black panel-fade-in">
        {renderPanel()}
    </div>
  );
};

export default PanelPage;
