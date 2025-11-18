import React from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import PresencePanel from '../components/panel/PresencePanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';

const PanelPage: React.FC = () => {
  const { session, councilMembers } = useSession();

  const renderPanel = () => {
    switch (session.panelView) {
      case PanelView.VOTING:
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
    <div className="w-screen h-screen bg-sapv-blue-dark overflow-hidden">
      {renderPanel()}
    </div>
  );
};

export default PanelPage;
