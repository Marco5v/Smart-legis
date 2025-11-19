

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { 
    SessionState, UserProfile, VoteOption, Project, SessionStatus, PanelView,
    LegislatureConfig, Party, Commission, SessionHistory, PublishedAta, Parecer, Amendment, SessionPhase, SessionConfig, SessionType, UserRole
} from '../types';
import { MOCK_USERS } from '../services/mockData';
import { 
    MOCK_LEGISLATURE_CONFIG, MOCK_PARTIES, MOCK_COMMISSIONS, MOCK_PROJECTS, MOCK_SESSION_HISTORY
} from '../services/mockData.extended';
import { setRegisterPresenceFn } from './AuthContext';


const SESSION_STORAGE_KEY = 'sapvSessionState';
const DATA_STORAGE_KEY = 'sapvDataState';


const initialSessionState: SessionState = {
  status: SessionStatus.INACTIVE,
  phase: SessionPhase.INICIAL,
  startTime: null,
  presence: {},
  panelView: PanelView.OFF,
  panelMessage: null,
  currentProject: null,
  votingOpen: false,
  isSymbolicVoting: false,
  votes: {},
  votingResult: null,
  speakerQueue: [],
  currentSpeaker: null,
  speakerTimerEndTime: null,
  speakerTimerPaused: false,
  defaultSpeakerDuration: 300, // 5 minutes in seconds
  interruptionRequest: null,
  pointOfOrderRequest: null,
  verificationRequest: null,
  microphoneStatus: {},
  operationalChat: [],
  // FIX: Add missing properties for backward compatibility
  pauseTime: null,
  totalPausedDuration: 0,
  sessionType: 'Ordinária',
  cityName: 'Exemplo',
  legislatureMembers: [],
};

interface DataState {
    legislatureConfig: LegislatureConfig;
    parties: Party[];
    commissions: Commission[];
    projects: Project[];
    sessionHistory: SessionHistory[];
    publishedAtas: PublishedAta[];
}

const initialDataState: DataState = {
    legislatureConfig: MOCK_LEGISLATURE_CONFIG,
    parties: MOCK_PARTIES,
    commissions: MOCK_COMMISSIONS,
    projects: MOCK_PROJECTS,
    sessionHistory: MOCK_SESSION_HISTORY,
    publishedAtas: [],
};


interface SessionContextType {
  session: SessionState;
  councilMembers: UserProfile[];
  
  // Data from DataState
  legislatureConfig: LegislatureConfig;
  parties: Party[];
  commissions: Commission[];
  projects: Project[];
  sessionHistory: SessionHistory[];
  publishedAtas: PublishedAta[];
  
  // Session Control
  startSession: () => void;
  endSession: () => void;
  setPhase: (phase: SessionPhase) => void;
  // FIX: Add missing functions for older components
  setupSession: (config: SessionConfig) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  
  // Presence
  togglePresence: (uid: string) => void;
  registerPresence: (uid: string) => void;

  // Panel Control
  setPanelView: (view: PanelView) => void;
  setPanelMessage: (message: string | null) => void;
  hideVoting: () => void; // Shortcut to set panel view to presence/off

  // Voting Control
  setCurrentProject: (project: Project | null) => void;
  setVotingStatus: (isOpen: boolean) => void;
  castVote: (uid: string, vote: VoteOption) => void;
  overrideVote: (uid: string, vote: VoteOption) => void;
  calculateResult: (presidentName: string) => void;
  restartVoting: () => void;
  annulVoting: () => void;
  startSymbolicVoting: () => void;
  resolveSymbolicVote: (result: 'approved' | 'rejected', presidentName: string) => void;
  resolveVerification: (granted: boolean, presidentName: string) => void;

  // Speaker Control
  requestToSpeak: (user: UserProfile) => void;
  advanceSpeakerQueue: () => void;
  setSpeakerTimer: (seconds: number) => void;
  pauseSpeakerTimer: () => void;
  addSpeakerTime: (seconds: number) => void;
  setDefaultSpeakerDuration: (seconds: number) => void;

  // Requests Control
  requestInterruption: (user: UserProfile) => void;
  resolveInterruption: (granted: boolean) => void;
  requestPointOfOrder: (user: UserProfile) => void;
  resolvePointOfOrder: () => void;
  requestVerification: (user: UserProfile) => void;
  
  // Microphone Control
  toggleMicrophone: (uid: string) => void;
  muteAllMicrophones: () => void;
  
  // Chat
  sendOperationalChatMessage: (user: {uid: string; name: string; role: any}, message: string) => void;
  
  // Data Management (Secretaria)
  addProject: (projectData: Omit<Project, 'id'|'votingStatus'|'amendments'|'pareceres'|'transmittalHistory'>) => void;
  addCommission: (commissionData: Omit<Commission, 'id'>) => void;
  addAmendment: (amendmentData: Omit<Amendment, 'id'>) => void;
  updateAmendment: (amendment: Amendment) => void;
  deleteAmendment: (amendmentId: string, projectId: string) => void;
  addParecer: (projectId: string, parecerData: Omit<Parecer, 'id' | 'date'>) => void;
  saveAtaDraft: (sessionId: string, content: string) => void;
  publishAta: (ataData: Omit<PublishedAta, 'id'>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState>(() => {
      try {
        const stored = localStorage.getItem(SESSION_STORAGE_KEY);
        return stored ? JSON.parse(stored) : initialSessionState;
      } catch { return initialSessionState; }
  });

  const [data, setData] = useState<DataState>(() => {
      try {
        const stored = localStorage.getItem(DATA_STORAGE_KEY);
        return stored ? JSON.parse(stored) : initialDataState;
      } catch { return initialDataState; }
  });

  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === SESSION_STORAGE_KEY && e.newValue) setSession(JSON.parse(e.newValue));
      if (e.key === DATA_STORAGE_KEY && e.newValue) setData(JSON.parse(e.newValue));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const councilMembers = MOCK_USERS.filter(u => u.role === 'Vereador' || u.role === 'Presidente');

  // Placeholder implementations
  const startSession = useCallback(() => {
    setSession(s => {
        const membersToInclude = s.legislatureMembers.length > 0 ? s.legislatureMembers : councilMembers.map(m => m.uid);
        const initialPresence = membersToInclude.reduce((acc, uid) => ({...acc, [uid]: false}), {});
        return {
            ...s, 
            status: SessionStatus.ACTIVE, 
            startTime: Date.now(), 
            presence: initialPresence, 
            phase: SessionPhase.INICIAL,
            totalPausedDuration: 0,
            pauseTime: null
        };
    });
  }, [councilMembers]);

  const endSession = useCallback(() => {
      // Logic to save session history would go here
      const newHistoryEntry: SessionHistory = {
          sessionId: `sess-${session.startTime}`,
          date: new Date(session.startTime!).toISOString(),
          finalPresence: Object.keys(session.presence).filter(uid => session.presence[uid]),
          votingRecords: data.projects
            .filter(p => p.votedInSessionId === `sess-${session.startTime}`)
            .map(p => ({
                projectTitle: p.title,
                result: "Resultado Simulado", // Placeholder
                votes: {} // Placeholder
            })),
      };
      
      setData(d => ({
          ...d,
          sessionHistory: [...d.sessionHistory, newHistoryEntry]
      }));

      setSession(initialSessionState);
  }, [session.startTime, session.presence, data.projects]);
  
  const setPhase = useCallback((phase: SessionPhase) => setSession(s => ({...s, phase})), []);

  // FIX: Implement missing functions for older components
  const setupSession = useCallback((config: SessionConfig) => {
    setSession(s => ({
        ...s,
        cityName: config.cityName,
        sessionType: config.sessionType,
        legislatureMembers: config.legislatureMembers,
    }));
    setData(d => ({
        ...d,
        legislatureConfig: {
            ...d.legislatureConfig,
            cityName: config.cityName,
            totalMembers: config.legislatureMembers.length,
        }
    }));
  }, []);

  const pauseSession = useCallback(() => {
    setSession(s => {
        if (s.status !== SessionStatus.ACTIVE) return s;
        return {
            ...s,
            status: SessionStatus.PAUSED,
            pauseTime: Date.now()
        };
    });
  }, []);

  const resumeSession = useCallback(() => {
    setSession(s => {
        if (s.status !== SessionStatus.PAUSED || !s.pauseTime) return s;
        const pausedDuration = Date.now() - s.pauseTime;
        return {
            ...s,
            status: SessionStatus.ACTIVE,
            pauseTime: null,
            totalPausedDuration: s.totalPausedDuration + pausedDuration
        };
    });
  }, []);
  
  const togglePresence = useCallback((uid: string) => setSession(s => ({...s, presence: {...s.presence, [uid]: !s.presence[uid]}})), []);
  
  const registerPresence = useCallback((uid: string) => {
    if (session.status === SessionStatus.ACTIVE) {
        setSession(s => ({...s, presence: {...s.presence, [uid]: true}}));
    }
  }, [session.status]);

  useEffect(() => {
    setRegisterPresenceFn(registerPresence);
  }, [registerPresence]);
  
  const setPanelView = useCallback((view: PanelView) => setSession(s => ({...s, panelView: view})), []);
  const setPanelMessage = useCallback((message: string | null) => setSession(s => ({...s, panelMessage: message})), []);
  const hideVoting = useCallback(() => setSession(s => ({...s, panelView: PanelView.PRESENCE, votingResult: null, votes: {}})), []);

  const setCurrentProject = useCallback((project: Project | null) => {
    setSession(s => ({ ...s, currentProject: project, votingOpen: false, votes: {}, votingResult: null, panelView: project ? PanelView.READING : PanelView.OFF, isSymbolicVoting: false }));
  }, []);

  const setVotingStatus = useCallback((isOpen: boolean) => setSession(s => ({...s, votingOpen: isOpen, panelView: isOpen ? PanelView.VOTING : s.panelView})), []);

  const castVote = useCallback((uid: string, vote: VoteOption) => {
    if(session.votingOpen) {
        setSession(s => ({...s, votes: {...s.votes, [uid]: vote}}));
    }
  }, [session.votingOpen]);

  const overrideVote = useCallback((uid: string, vote: VoteOption) => setSession(s => ({...s, votes: {...s.votes, [uid]: vote}})), []);
  
  const calculateResult = useCallback((presidentName: string) => {
      // Mock implementation
      setSession(s => ({...s, votingOpen: false, votingResult: "APROVADO POR MAIORIA SIMPLES", panelView: PanelView.VOTING}));
      // In a real scenario, this would check majority types, quorum etc.
  }, []);

  const restartVoting = useCallback(() => setSession(s => ({...s, votes: {}, votingResult: null, votingOpen: false})), []);
  const annulVoting = useCallback(() => setSession(s => ({...s, votes: {}, votingResult: "VOTAÇÃO ANULADA", votingOpen: false})), []);
  
  const startSymbolicVoting = useCallback(() => setSession(s => ({...s, votingOpen: false, isSymbolicVoting: true, votes: {}, votingResult: null})), []);
  const resolveSymbolicVote = useCallback((result: 'approved' | 'rejected', presidentName: string) => {
      const resultText = result === 'approved' ? 'APROVADO EM VOTAÇÃO SIMBÓLICA' : 'REJEITADO EM VOTAÇÃO SIMBÓLICA';
      setSession(s => ({...s, isSymbolicVoting: false, votingResult: resultText, verificationRequest: null}));
  }, []);
  const resolveVerification = useCallback((granted: boolean, presidentName: string) => {
    if (granted) {
        setSession(s => ({...s, isSymbolicVoting: false, votingOpen: true, verificationRequest: null, panelView: PanelView.VOTING}));
    } else {
        setSession(s => ({...s, isSymbolicVoting: false, votingResult: 'MANTIDO RESULTADO SIMBÓLICO', verificationRequest: null}));
    }
  }, []);


  const requestToSpeak = useCallback((user: UserProfile) => setSession(s => ({...s, speakerQueue: [...s.speakerQueue, user]})), []);
  const advanceSpeakerQueue = useCallback(() => {
    setSession(s => {
        const [nextSpeaker, ...rest] = s.speakerQueue;
        const endTime = nextSpeaker ? Date.now() + s.defaultSpeakerDuration * 1000 : null;
        return {...s, currentSpeaker: nextSpeaker || null, speakerQueue: rest, speakerTimerEndTime: endTime, speakerTimerPaused: false, panelView: nextSpeaker ? PanelView.SPEAKER : PanelView.PRESENCE};
    });
  }, []);
  const setSpeakerTimer = useCallback((seconds: number) => setSession(s => ({...s, speakerTimerEndTime: Date.now() + seconds * 1000})), []);
  const pauseSpeakerTimer = useCallback(() => setSession(s => ({...s, speakerTimerPaused: !s.speakerTimerPaused})), []);
  const addSpeakerTime = useCallback((seconds: number) => setSession(s => ({...s, speakerTimerEndTime: (s.speakerTimerEndTime || Date.now()) + seconds * 1000})), []);
  const setDefaultSpeakerDuration = useCallback((seconds: number) => setSession(s => ({...s, defaultSpeakerDuration: seconds})), []);

  const requestInterruption = useCallback((user: UserProfile) => setSession(s => ({...s, interruptionRequest: {from: user, active: true}})), []);
  const resolveInterruption = useCallback((granted: boolean) => setSession(s => ({...s, interruptionRequest: null})), []);
  const requestPointOfOrder = useCallback((user: UserProfile) => setSession(s => ({...s, pointOfOrderRequest: {from: user, active: true}})), []);
  const resolvePointOfOrder = useCallback(() => setSession(s => ({...s, pointOfOrderRequest: null})), []);
  const requestVerification = useCallback((user: UserProfile) => setSession(s => ({...s, verificationRequest: {from: user, active: true}})), []);
  
  const toggleMicrophone = useCallback((uid: string) => setSession(s => ({...s, microphoneStatus: {...s.microphoneStatus, [uid]: !s.microphoneStatus[uid]}})), []);
  const muteAllMicrophones = useCallback(() => setSession(s => ({...s, microphoneStatus: {}})), []);
  
  const sendOperationalChatMessage = useCallback((user: {uid: string; name: string; role: any}, message: string) => {
    const chatMessage = { timestamp: Date.now(), user, message };
    setSession(s => ({...s, operationalChat: [...s.operationalChat, chatMessage]}));
  }, []);
  
  const addProject = useCallback((projectData: Omit<Project, 'id'|'votingStatus'|'amendments'|'pareceres'|'transmittalHistory'>) => {
    const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        votingStatus: 'pending',
        amendments: [],
        pareceres: [],
        transmittalHistory: [{ date: new Date().toISOString(), event: 'Projeto protocolado.', author: 'Secretaria' }]
    };
    setData(d => ({...d, projects: [newProject, ...d.projects]}));
  }, []);

  const addCommission = useCallback((commissionData: Omit<Commission, 'id'>) => {
      const newCommission: Commission = {...commissionData, id: `comm-${Date.now()}`};
      setData(d => ({...d, commissions: [newCommission, ...d.commissions]}));
  }, []);

  const addAmendment = useCallback((amendmentData: Omit<Amendment, 'id'>) => {
      const newAmendment: Amendment = {...amendmentData, id: `amend-${Date.now()}`};
      setData(d => ({...d, projects: d.projects.map(p => p.id === newAmendment.parentProjectId ? {...p, amendments: [...(p.amendments || []), newAmendment]} : p)}));
  }, []);
  
  const updateAmendment = useCallback((amendment: Amendment) => {
      setData(d => ({...d, projects: d.projects.map(p => p.id === amendment.parentProjectId ? {...p, amendments: p.amendments?.map(a => a.id === amendment.id ? amendment : a) } : p)}))
  }, []);

  const deleteAmendment = useCallback((amendmentId: string, projectId: string) => {
      setData(d => ({...d, projects: d.projects.map(p => p.id === projectId ? {...p, amendments: p.amendments?.filter(a => a.id !== amendmentId)} : p)}))
  }, []);
  
  const addParecer = useCallback((projectId: string, parecerData: Omit<Parecer, 'id' | 'date'>) => {
      const newParecer: Parecer = {...parecerData, id: `par-${Date.now()}`, date: new Date().toISOString()};
      setData(d => ({...d, projects: d.projects.map(p => p.id === projectId ? {...p, pareceres: [...(p.pareceres || []), newParecer]} : p)}));
  }, []);
  
  const saveAtaDraft = useCallback((sessionId: string, content: string) => {
      setData(d => ({...d, sessionHistory: d.sessionHistory.map(h => h.sessionId === sessionId ? {...h, ataDraftContent: content} : h)}));
  }, []);
  
  const publishAta = useCallback((ataData: Omit<PublishedAta, 'id'>) => {
      const newAta: PublishedAta = {...ataData, id: `ata-${Date.now()}`};
      setData(d => ({...d, publishedAtas: [newAta, ...d.publishedAtas]}));
  }, []);


  return (
    <SessionContext.Provider value={{
        session, councilMembers, ...data,
        startSession, endSession, setPhase,
        setupSession, pauseSession, resumeSession,
        togglePresence, registerPresence,
        setPanelView, setPanelMessage, hideVoting,
        setCurrentProject, setVotingStatus, castVote, overrideVote, calculateResult, restartVoting, annulVoting, startSymbolicVoting, resolveSymbolicVote, resolveVerification,
        requestToSpeak, advanceSpeakerQueue, setSpeakerTimer, pauseSpeakerTimer, addSpeakerTime, setDefaultSpeakerDuration,
        requestInterruption, resolveInterruption, requestPointOfOrder, resolvePointOfOrder, requestVerification,
        toggleMicrophone, muteAllMicrophones,
        sendOperationalChatMessage,
        addProject, addCommission, addAmendment, updateAmendment, deleteAmendment, addParecer, saveAtaDraft, publishAta,
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
