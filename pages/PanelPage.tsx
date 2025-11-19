
import React from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionPhase } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import PresencePanel from '../components/panel/PresencePanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';
import VotingPanel from '../components/panel/VotingPanel';

const PanelPage: React.FC = () => {
  const { session, councilMembers } = useSession();

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
    <div className="w-screen h-screen overflow-hidden bg-sapv-blue-dark">
      <div key={session.panelView} className="w-full h-full panel-fade-in">
        {renderPanel()}
      </div>
    </div>
  );
};

export default PanelPage;
