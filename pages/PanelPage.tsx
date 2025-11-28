import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionStatus } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';
import VotingPanel from '../components/panel/VotingPanel';
import PresencePanel from '../components/panel/PresencePanel';

const PanelPage: React.FC = () => {
  const { session, councilMembers } = useSession();

  // A tela de espera (OFF) ocupa a tela inteira.
  if (session.status === SessionStatus.INACTIVE) {
      return <OffPanel />;
  }
  
  const presentMembers = Object.keys(session.presence).filter(uid => session.presence[uid]);

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
        return <PresencePanel councilMembers={councilMembers} presentMembers={presentMembers} />;
      case PanelView.OFF:
      default:
        return <OffPanel />;
    }
  };

  return (
    <div key={session.panelView} className="w-screen h-screen overflow-hidden bg-black panel-fade-in">
        {renderPanel()}
    </div>
  );
};

export default PanelPage;
