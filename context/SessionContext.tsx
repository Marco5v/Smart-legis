import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { SessionState, PanelView, Project, UserProfile, VoteOption, LegislatureConfig, SessionHistory, Party, PublishedAta, Amendment, Commission, Parecer, TransmittalHistoryEntry, MajorityType } from '../types';
import { MOCK_PROJECTS, MOCK_LEGISLATURE_CONFIG, getVereadores, MOCK_PARTIES, MOCK_SESSION_HISTORY, MOCK_COMMISSIONS } from '../services/mockData';

const initialState: SessionState = {
  id: 'local_session',
  status: 'inactive',
  phase: 'Inactive',
  panelView: PanelView.OFF,
  panelMessage: null,
  presence: {},
  currentProject: null,
  votingOpen: false,
  votes: {},
  votingResult: null,
  speakerQueue: [],
  currentSpeaker: null,
  speakerTimerEndTime: null,
  speakerTimerPaused: false,
  speakerHistory: [],
  interruptionRequest: null,
  pointOfOrderRequest: null,
  operationalChat: [],
  microphoneStatus: {},
  isSymbolicVoting: false,
  verificationRequest: null,
};

interface SessionContextType {
  session: SessionState;
  projects: Project[];
  parties: Party[];
  councilMembers: UserProfile[];
  legislatureConfig: LegislatureConfig;
  sessionHistory: SessionHistory[];
  publishedAtas: PublishedAta[];
  commissions: Commission[];
  
  startSession: () => boolean;
  endSession: () => void;
  registerPresence: (vereadorId: string) => void;
  togglePresence: (vereadorId: string) => void;
  setPhase: (phase: SessionState['phase']) => void;
  
  setPanelView: (view: PanelView) => void;
  hideVoting: () => void;
  setPanelMessage: (message: string | null) => void;
  setCurrentProject: (project: Project | null) => void;
  setVotingStatus: (isOpen: boolean) => void;
  castVote: (vereadorId: string, vote: VoteOption) => void;
  overrideVote: (vereadorId: string, vote: VoteOption) => void;
  calculateResult: (presidentName: string) => void;
  restartVoting: () => void;
  annulVoting: () => void;
  requestToSpeak: (vereador: UserProfile) => void;
  advanceSpeakerQueue: () => void;
  setSpeakerTimer: (durationInSeconds: number) => void;
  pauseSpeakerTimer: () => void;
  addSpeakerTime: (seconds: number) => void;
  requestInterruption: (vereador: UserProfile) => void;
  resolveInterruption: (granted: boolean) => void;
  requestPointOfOrder: (vereador: UserProfile) => void;
  resolvePointOfOrder: () => void;
  // FIX: Correctly typed the 'user' parameter using Pick<UserProfile, ...> to resolve the generic type error.
  sendOperationalChatMessage: (user: Pick<UserProfile, 'uid' | 'name' | 'role'>, message: string) => void;
  toggleMicrophone: (vereadorId: string) => void;
  startSymbolicVoting: () => void;
  resolveSymbolicVote: (result: 'approved' | 'rejected', presidentName: string) => void;
  requestVerification: (user: UserProfile) => void;
  resolveVerification: (accepted: boolean, presidentName: string) => void;

  addProject: (project: Omit<Project, 'id' | 'votingStatus' | 'amendments' | 'pareceres' | 'transmittalHistory'>) => void;
  addAmendment: (amendmentData: Omit<Amendment, 'id'>) => void;
  updateAmendment: (updatedAmendment: Amendment) => void;
  deleteAmendment: (amendmentId: string, parentProjectId: string) => void;
  publishAta: (ata: Omit<PublishedAta, 'id'>) => void;
  saveAtaDraft: (sessionId: string, content: string) => void;
  addCommission: (commission: Omit<Commission, 'id'>) => void;
  addParecer: (projectId: string, parecer: Omit<Parecer, 'id' | 'date'>) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const SESSION_STORAGE_KEY = 'smartLegisSessionState';

export const SessionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Dados "Nuvem"
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [parties] = useState<Party[]>(MOCK_PARTIES);
  const [councilMembers] = useState<UserProfile[]>(getVereadores());
  const [legislatureConfig] = useState<LegislatureConfig>(MOCK_LEGISLATURE_CONFIG);
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>(MOCK_SESSION_HISTORY);
  const [publishedAtas, setPublishedAtas] = useState<PublishedAta[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [pauta, setPauta] = useState<Project[]>([]);

  // Estado da sessão local, sincronizado com localStorage
  const [session, setSession] = useState<SessionState>(() => {
    try {
      const storedState = localStorage.getItem(SESSION_STORAGE_KEY);
      return storedState ? JSON.parse(storedState) : initialState;
    } catch (e) {
      console.error("Failed to load session from localStorage", e);
      return initialState;
    }
  });

  // Salva no localStorage a cada mudança
  useEffect(() => {
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);
  
  // Ouve mudanças de outras abas/janelas
  useEffect(() => {
    const onStorageChange = (e: StorageEvent) => {
        if (e.key === SESSION_STORAGE_KEY && e.newValue) {
            try {
                setSession(JSON.parse(e.newValue));
            } catch (err) {
                 console.error("Failed to parse session from storage event", err);
            }
        }
    };
    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const addHistoryEntry = useCallback((projectId: string, event: string, author: string = "Sistema") => {
    setPauta(currentPauta => currentPauta.map(p => {
        if (p.id === projectId) {
            const newEntry: TransmittalHistoryEntry = {
                date: new Date().toISOString(),
                author,
                event,
            };
            const newHistory = [...(p.transmittalHistory || []), newEntry];
            return { ...p, transmittalHistory: newHistory };
        }
        return p;
    }));
  }, []);

  const startSession = useCallback((): boolean => {
    const presentCount = Object.values(session.presence).filter(p => p).length;
    if (presentCount < legislatureConfig.quorumToOpen) {
      console.error("Quorum not met");
      return false;
    }
    
    const pautaDaSessao = projects.filter(p => p.workflowStatus === 'Pronto para Pauta');
    setPauta(pautaDaSessao);

    setSession(s => ({
        ...initialState,
        id: `local_session_${Date.now()}`,
        status: 'active',
        presence: s.presence, // Manter a presença já registrada
        microphoneStatus: Object.keys(s.presence).reduce((acc, key) => ({...acc, [key]: false}), {}),
        panelView: PanelView.PRESENCE,
        phase: 'Expediente'
    }));
    return true;
  }, [session.presence, legislatureConfig.quorumToOpen, projects]);

  const endSession = useCallback(() => {
    setSession(s => {
        const historyEntry: SessionHistory = {
            sessionId: s.id,
            date: new Date().toISOString(),
            finalPresence: Object.keys(s.presence).filter(id => s.presence[id]),
            votingRecords: pauta
              .filter(p => p.votedInSessionId === s.id)
              .map(p => ({
                  projectTitle: p.title,
                  result: p.votingStatus === 'approved' ? 'APROVADO' : 'REJEITADO',
                  votes: {} // Placeholder for votes if needed
              })),
            // ... copy other relevant final state fields from `s`
            ...s
        };
        setSessionHistory(h => [...h, historyEntry]);
        return initialState;
    });
    setPauta([]);
  }, [pauta]);

  const registerPresence = useCallback((vereadorId: string) => {
    if (session.status === 'inactive') {
      setSession(s => ({ ...s, presence: { ...s.presence, [vereadorId]: true }}));
    }
  }, [session.status]);
  
  const togglePresence = useCallback((vereadorId: string) => {
     setSession(s => {
        const newPresence = { ...s.presence, [vereadorId]: !s.presence[vereadorId] };
        const newMicStatus = { ...s.microphoneStatus };
        if(newPresence[vereadorId]) {
            newMicStatus[vereadorId] = false;
        } else {
            delete newMicStatus[vereadorId];
        }
        return { ...s, presence: newPresence, microphoneStatus: newMicStatus };
     });
  }, []);
  
  const calculateResult = useCallback((presidentName: string) => {
        setSession(s => {
            const project = s.currentProject;
            if (!project || s.votingOpen === false) return s;
            
            const simVotes = Object.values(s.votes).filter(v => v === VoteOption.SIM).length;
            const { majority } = project.votingRules;
            const { totalMembers } = legislatureConfig;
            const presentCount = Object.values(s.presence).filter(p => p).length;
            let requiredVotes = 0;
            let result = "REJEITADO";

            switch(majority) {
                case MajorityType.SIMPLES:
                    requiredVotes = Math.floor(presentCount / 2) + 1;
                    if (simVotes >= requiredVotes) result = `APROVADO POR MAIORIA SIMPLES`;
                    break;
                case MajorityType.ABSOLUTA:
                    requiredVotes = Math.floor(totalMembers / 2) + 1;
                     if (simVotes >= requiredVotes) result = `APROVADO POR MAIORIA ABSOLUTA`;
                    break;
                case MajorityType.QUALIFICADA:
                case MajorityType.DOIS_TERCOS:
                    requiredVotes = Math.ceil((totalMembers * 2) / 3);
                    if (simVotes >= requiredVotes) result = `APROVADO POR MAIORIA QUALIFICADA 2/3`;
                    break;
            }
            
            const resultStatus = result.includes('APROVADO') ? 'approved' : 'rejected';
            const eventText = `Votação nominal encerrada. Resultado: ${result}.`;
            addHistoryEntry(project.id, eventText, `Presidente ${presidentName}`);
            setPauta(p => p.map(proj => proj.id === project.id ? { ...proj, votingStatus: resultStatus, votedInSessionId: s.id } : proj));

            return { ...s, votingResult: result, votingOpen: false };
        });
    }, [legislatureConfig, addHistoryEntry]);

  // Implement other methods directly using setSession
  const setPanelView = useCallback((view: PanelView) => setSession(s => ({ ...s, panelView: view })), []);
  const hideVoting = useCallback(() => setSession(s => ({ ...s, panelView: PanelView.OFF })), []);
  const setPanelMessage = useCallback((message: string | null) => setSession(s => ({ ...s, panelMessage: message, panelView: message ? PanelView.MESSAGE : s.panelView })), []);
  const setCurrentProject = useCallback((project: Project | null) => setSession(s => ({ ...s, currentProject: project, votingOpen: false, votes: {}, votingResult: null, isSymbolicVoting: false })), []);
  const setVotingStatus = useCallback((isOpen: boolean) => setSession(s => ({ ...s, votingOpen: isOpen, votes: isOpen ? {} : s.votes, votingResult: null, panelView: isOpen ? PanelView.VOTING : s.panelView })), []);
  const castVote = useCallback((vereadorId: string, vote: VoteOption) => setSession(s => s.votingOpen ? ({ ...s, votes: { ...s.votes, [vereadorId]: vote }}) : s), []);
  const overrideVote = useCallback((vereadorId: string, vote: VoteOption) => setSession(s => ({ ...s, votes: { ...s.votes, [vereadorId]: vote }})), []);
  const restartVoting = useCallback(() => setSession(s => ({ ...s, votes: {}, votingResult: null, votingOpen: false })), []);
  const annulVoting = useCallback(() => setSession(s => ({ ...s, votingResult: 'VOTAÇÃO ANULADA', votingOpen: false })), []);
  const requestToSpeak = useCallback((vereador: UserProfile) => setSession(s => !s.speakerQueue.some(v=>v.uid === vereador.uid) ? ({ ...s, speakerQueue: [...s.speakerQueue, vereador] }) : s), []);
  const setPhase = useCallback((phase: SessionState['phase']) => setSession(s => ({ ...s, phase })), []);
  const advanceSpeakerQueue = useCallback(() => {
        setSession(s => {
            const newQueue = [...s.speakerQueue];
            const nextSpeaker = newQueue.shift() || null;
            return {
                ...s,
                currentSpeaker: nextSpeaker,
                speakerQueue: newQueue,
                panelView: nextSpeaker ? PanelView.SPEAKER : s.panelView,
                speakerTimerEndTime: null,
            };
        });
    }, []);
    // FIX: Corrected the user parameter type to match the interface definition.
    const sendOperationalChatMessage = useCallback((user: Pick<UserProfile, 'uid' | 'name' | 'role'>, message: string) => {
        const chatMessage = { timestamp: Date.now(), user, message };
        setSession(s => ({ ...s, operationalChat: [...s.operationalChat, chatMessage]}));
    }, []);

    // Placeholder/simplified implementations for other functions
    const setSpeakerTimer = useCallback((durationInSeconds: number) => setSession(s => ({ ...s, speakerTimerEndTime: Date.now() + durationInSeconds * 1000 })), []);
    const pauseSpeakerTimer = useCallback(() => setSession(s => ({ ...s, speakerTimerPaused: !s.speakerTimerPaused })), []); // Basic toggle
    const addSpeakerTime = useCallback((seconds: number) => setSession(s => ({...s, speakerTimerEndTime: (s.speakerTimerEndTime || Date.now()) + seconds * 1000 })), []);
    const requestInterruption = useCallback((vereador: UserProfile) => setSession(s => ({ ...s, interruptionRequest: { from: vereador, active: true } })), []);
    const resolveInterruption = useCallback(() => setSession(s => ({...s, interruptionRequest: null })), []);
    const requestPointOfOrder = useCallback((vereador: UserProfile) => setSession(s => ({ ...s, pointOfOrderRequest: { from: vereador, active: true } })), []);
    const resolvePointOfOrder = useCallback(() => setSession(s => ({ ...s, pointOfOrderRequest: null })), []);
    const toggleMicrophone = useCallback((vereadorId: string) => setSession(s => ({...s, microphoneStatus: { ...s.microphoneStatus, [vereadorId]: !s.microphoneStatus[vereadorId]}})), []);
    const startSymbolicVoting = useCallback(() => setSession(s => ({...s, isSymbolicVoting: true, panelView: PanelView.MESSAGE, panelMessage: "VOTAÇÃO SIMBÓLICA"})), []);
    const resolveSymbolicVote = useCallback((result: 'approved' | 'rejected', presidentName: string) => {
      setSession(s => {
        if (!s.currentProject) return s;
        const resultText = result === 'approved' ? 'APROVADO SIMBOLICAMENTE' : 'REJEITADO';
        addHistoryEntry(s.currentProject.id, `Votação simbólica: ${resultText}`, presidentName);
        setPauta(p => p.map(proj => proj.id === s.currentProject?.id ? { ...proj, votingStatus: result } : proj));
        return {...s, votingResult: resultText, isSymbolicVoting: false, panelMessage: null, panelView: PanelView.OFF };
      });
    }, [addHistoryEntry]);
    const requestVerification = useCallback((user: UserProfile) => setSession(s => ({ ...s, verificationRequest: { from: user, active: true } })), []);
    const resolveVerification = useCallback((accepted: boolean, presidentName: string) => {
      setSession(s => {
        if (accepted && s.currentProject) {
            addHistoryEntry(s.currentProject.id, "Verificação de votação deferida. Votação convertida para Nominal.", presidentName);
            return { ...s, verificationRequest: null, isSymbolicVoting: false, votingOpen: true, panelView: PanelView.VOTING, panelMessage: null };
        }
        return { ...s, verificationRequest: null };
      });
    }, [addHistoryEntry]);

    // Funções de "Nuvem" (CRUD) - permanecem as mesmas
     const addProject = useCallback((projectData: Omit<Project, 'id' | 'votingStatus' | 'amendments' | 'pareceres' | 'transmittalHistory'>) => {
        const newProject: Project = { ...projectData, id: `proj-${Date.now()}`, votingStatus: 'pending' };
        setProjects(p => [...p, newProject]);
    }, []);
    const addAmendment = (data: any) => {};
    const updateAmendment = (data: any) => {};
    const deleteAmendment = (id1: any, id2: any) => {};
    const publishAta = (data: any) => {};
    const saveAtaDraft = (id: any, content: any) => {};
    const addCommission = (data: any) => {};
    const addParecer = (id: any, data: any) => {};


  return (
    <SessionContext.Provider value={{
      session, projects, parties, councilMembers, legislatureConfig, sessionHistory, publishedAtas, commissions,
      startSession, endSession, registerPresence, togglePresence, setPhase,
      setPanelView, hideVoting, setPanelMessage, setCurrentProject, setVotingStatus, castVote,
      overrideVote, calculateResult, restartVoting, annulVoting, requestToSpeak, advanceSpeakerQueue,
      setSpeakerTimer, pauseSpeakerTimer, addSpeakerTime, requestInterruption, resolveInterruption,
      requestPointOfOrder, resolvePointOfOrder, sendOperationalChatMessage, toggleMicrophone,
      startSymbolicVoting, resolveSymbolicVote, requestVerification, resolveVerification,
      addProject, addAmendment, updateAmendment, deleteAmendment, publishAta, saveAtaDraft, addCommission, addParecer,
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