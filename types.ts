// Perfis e Permissões
export enum UserRole {
  PRESIDENTE = 'Presidente',
  MESA_DIRETORA = 'Mesa Diretora',
  VEREADOR = 'Vereador',
  SECRETARIA = 'Secretaria',
  CONTROLADOR = 'Controlador',
  PUBLICO = 'Público',
  ASSESSORIA = 'Assessoria',
  SUPORTE = 'Suporte',
}

export interface UserProfile {
  uid: string;
  name: string; // Nome Parlamentar
  fullName?: string; // Nome Completo
  party: string;
  photoUrl: string;
  email: string;
  role: UserRole;
  boardRole?: 'Presidente' | 'Vice-Presidente' | '1º Secretário' | '2º Secretário';
}

// Configuração da Legislatura
export interface LegislatureConfig {
    id: string;
    cityName: string;
    totalMembers: number;
    quorumToOpen: number; // Maioria simples
    votingQuorum: number; // Quorum para iniciar votação
    startDate: string;
    endDate: string;
}

// Partidos
export interface Party {
    id: string;
    name: string;
    acronym: string;
}

// Comissões
export interface CommissionMember {
    profile: UserProfile;
    role: 'Presidente' | 'Relator' | 'Membro';
}
export interface Commission {
    id: string;
    name: string;
    description: string;
    members: CommissionMember[];
}


// Projetos e Tramitação
export enum ProjectWorkflowStatus {
    PROTOCOLADO = 'Protocolado',
    NAS_COMISSOES = 'Nas Comissões',
    AGUARDANDO_PARECER = 'Aguardando Parecer',
    PRONTO_PARA_PAUTA = 'Pronto para Pauta',
    LIDO_EM_PLENARIO = 'Lido em Plenário',
    VOTADO = 'Votado',
    ARQUIVADO = 'Arquivado',
    PREJUDICADO = 'Prejudicado',
}

export enum ProjectPhase {
    EXPEDIENTE = 'Expediente',
    ORDEM_DO_DIA = 'Ordem do Dia',
}

export interface TransmittalHistoryEntry {
    date: string; // ISO
    event: string;
    author: string; // Nome de quem realizou a ação
}

export interface Parecer {
    id: string;
    date: string; // ISO
    commissionId: string;
    commissionName: string;
    author: UserProfile;
    content: string;
    status: 'Favorável' | 'Contrário';
}

export interface Amendment {
    id: string;
    parentProjectId: string;
    title: string;
    description: string;
    author: UserProfile;
}

export enum VotingType {
    NOMINAL = 'Nominal',
    SIMBOLICA = 'Simbólica',
}

export enum MajorityType {
    SIMPLES = 'Maioria Simples', // Metade + 1 dos presentes
    ABSOLUTA = 'Maioria Absoluta', // Metade + 1 do total de membros
    QUALIFICADA = 'Maioria Qualificada (2/3)', // 2/3 do total de membros
}

export interface Project {
    id: string;
    number: string;
    date: string; // ISO
    title: string;
    description: string;
    author: UserProfile;
    proposingInstitution?: string;
    matterType: string;
    workflowStatus: ProjectWorkflowStatus;
    projectPhase?: ProjectPhase;
    
    // Votação
    votingStatus: 'pending' | 'open' | 'closed' | 'result_published';
    votingRules: {
        type: VotingType;
        majority: MajorityType;
    };
    turns?: 'Turno Único' | '2 Turnos' | '3 Turnos';
    secretVote?: boolean;

    // Tramitação
    assignedCommissionIds?: string[];
    transmittalHistory?: TransmittalHistoryEntry[];
    pareceres?: Parecer[];
    amendments?: Amendment[];
    readInSessionId?: string; // ID da sessão em que foi lido
    votedInSessionId?: string; // ID da sessão em que foi votado
    parentProjectId?: string; // Para emendas e substitutivos
    blockVotedProjectIds?: string[]; // Para projetos de votação em bloco
}

// Sessão Plenária
export enum SessionStatus {
    INACTIVE = 'inactive',
    ACTIVE = 'active',
    PAUSED = 'paused',
}

export enum SessionPhase {
    INICIAL = 'Inicial',
    EXPEDIENTE = 'Expediente',
    ORDEM_DO_DIA = 'Ordem do Dia',
    ENCERRADA = 'Encerrada',
}

export enum VoteOption {
    SIM = 'Sim',
    NAO = 'Não',
    ABS = 'Abster-se',
}

export type Votes = Record<string, VoteOption>; // { [uid]: VoteOption }

export enum PanelView {
    OFF = 'off',
    PRESENCE = 'presence',
    SPEAKER = 'speaker',
    VOTING = 'voting',
    MESSAGE = 'message',
    READING = 'reading',
}

export interface OperationalChatMessage {
    timestamp: number;
    user: {
        uid: string;
        name: string;
        role: UserRole;
    };
    message: string;
}

// FIX: Add missing types for older components
export type SessionType = 'Ordinária' | 'Extraordinária' | 'Solene';

export interface SessionConfig {
    cityName: string;
    sessionType: SessionType;
    legislatureMembers: string[];
}

// Estado central da sessão
export interface SessionState {
    status: SessionStatus;
    phase: SessionPhase;
    startTime: number | null;
    
    // FIX: Add missing properties for older components
    pauseTime: number | null;
    totalPausedDuration: number;
    sessionType: SessionType;
    cityName: string;
    legislatureMembers: string[];

    // Controle de Presença
    presence: Record<string, boolean>; // { [uid]: isPresent }
    confirmedAbsence: Record<string, boolean>; // { [uid]: isConfirmedAbsent }
    
    // Controle do Painel Público
    panelView: PanelView;
    panelMessage: string | null;

    // Controle de Votação
    currentProject: Project | null;
    votingOpen: boolean;
    isSymbolicVoting: boolean;
    votes: Votes;
    votingResult: string | null; // ex: "Aprovado por Maioria Simples"

    // Controle da Tribuna
    speakerQueue: UserProfile[];
    currentSpeaker: UserProfile | null;
    speakerTimerEndTime: number | null;
    speakerTimerPaused: boolean;
    defaultSpeakerDuration: number; // in seconds

    // Requisições
    interruptionRequest: { from: UserProfile, active: boolean } | null;
    pointOfOrderRequest: { from: UserProfile, active: boolean } | null;
    verificationRequest: { from: UserProfile, active: boolean } | null;

    // Microfones
    microphoneStatus: Record<string, boolean>; // { [uid]: isMicOn }

    // Chat
    operationalChat: OperationalChatMessage[];
}

// Histórico
export interface VotingRecord {
    projectTitle: string;
    result: string;
    votes: Votes;
}

export interface SessionHistory {
    sessionId: string;
    date: string; // ISO
    finalPresence: string[]; // array of uids
    votingRecords: VotingRecord[];
    ataDraftContent?: string;
}

export interface PublishedAta {
    id: string;
    sessionId: string;
    date: string; // ISO
    title: string;
    content: string;
}

// Suporte e Auditoria
export interface SystemLog {
  id: string;
  timestamp: number;
  action: string; // ex: "LOGIN", "VOTO_REGISTRADO", "SESSAO_INICIADA"
  user: string; // Nome do usuário que realizou a ação
  details?: string;
}

export interface DeviceStatus {
  uid: string; // ID do vereador
  memberName: string;
  status: 'online' | 'offline' | 'unstable';
  batteryLevel: number;
  lastPing: number; // timestamp
  ipAddress: string;
}