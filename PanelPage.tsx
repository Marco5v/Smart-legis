import React from 'react';
import { useSession } from '../context/SessionContext';
import { PanelView, SessionStatus } from '../types';
import OffPanel from '../components/panel/OffPanel';
import SpeakerPanel from '../components/panel/SpeakerPanel';
import MessagePanel from '../components/panel/MessagePanel';
import ReadingPanel from '../components/panel/ReadingPanel';
import VotingPanel from '../components/panel/VotingPanel';
import PresencePanel from '../components/panel/PresencePanel';
import { motion, AnimatePresence } from 'framer-motion';

const panelVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const PanelPage: React.FC = () => {
  const { session } = useSession();

  if (session.status === SessionStatus.INACTIVE) {
      return <OffPanel />;
  }
  
  const renderPanel = () => {
    switch (session.panelView) {
      case PanelView.VOTING:
        return <motion.div key="voting" variants={panelVariants} initial="initial" animate="animate" exit="exit"><VotingPanel /></motion.div>;
      case PanelView.SPEAKER:
        return <motion.div key="speaker" variants={panelVariants} initial="initial" animate="animate" exit="exit"><SpeakerPanel currentSpeaker={session.currentSpeaker} speakerTimerEndTime={session.speakerTimerEndTime} /></motion.div>;
      case PanelView.READING:
        return <motion.div key="reading" variants={panelVariants} initial="initial" animate="animate" exit="exit"><ReadingPanel project={session.currentProject} /></motion.div>;
      case PanelView.MESSAGE:
        return <motion.div key="message" variants={panelVariants} initial="initial" animate="animate" exit="exit"><MessagePanel message={session.panelMessage} /></motion.div>;
      case PanelView.PRESENCE:
      case PanelView.OFF:
      default:
        return <motion.div key="presence" variants={panelVariants} initial="initial" animate="animate" exit="exit"><PresencePanel /></motion.div>;
    }
  };

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
        <AnimatePresence mode="wait">
            {renderPanel()}
        </AnimatePresence>
    </div>
  );
};

export default PanelPage;
