export enum UserRole {
  CONTROLADOR = 'controlador',
  PRESIDENTE = 'presidente', // Novo papel
  MESA_DIRETORA = 'mesa_diretora',
  VEREADOR = 'vereador',
  SECRETARIA = 'secretaria',
  PUBLICO = 'publico',
}

export interface UserProfile {
  uid: string;
  name: string; // Nome Parlamentar
  fullName?: string;
  party: string;
  role: UserRole;
  email: string;
  photoUrl?: string;
  bio?: string;
  boardRole?: string; // Papel na Mesa Diretora (VICE, 1ºSEC, etc.)
}

export interface Party {
    id: string;
    name: string;
    acronym: string;
}

export interface LegislatureConfig {
    totalMembers: number;
    quorumToOpen: number; // Ex: 1/3 do totalMembers
    votingQuorum: number; // Ex: 50% + 1
    startDate: string;
    endDate: string;
}

export enum VotingType {
    SIMBOLICA = 'Simbólica',
    NOMINAL = 'Nominal',
}

export enum MajorityType {
    SIMPLES = 'Maioria Simples', // Metade + 1 dos PRESENTES
    ABSOLUTA = 'Maioria Absoluta', // Metade + 1 do TOTAL de membros
    QUALIFICADA = 'Maioria Qualificada 2/3', // 2/3 do TOTAL de membros
    ABSOLUTA_INVERTIDA = 'Maioria Abs. Invertida',
    DOIS_TERCOS = 'Votação 2/3',
}

export type ProjectWorkflowStatus = 'Protocolado' | 'Lido em Plenário' | 'Nas Comissões' | 'Aguardando Parecer' | 'Pronto para Pauta' | 'Arquivado' | 'Prejudicado';

export interface Amendment {
  id: string;
  parentProjectId: string;
  title: string;
  description: string;
  author: UserProfile;
}

export interface Parecer {
    id: string;
    commissionId: string;
    commissionName: string;
    author: UserProfile; // Relator
    content: string;
    status: 'Favorável' | 'Contrário';
    date: string;
}

export interface VotingRules {
  type: VotingType;
  majority: MajorityType;
}

export interface TransmittalHistoryEntry {
  date: string;
  author: string;
  event: string;
}

export interface Project {
  id: string;
  number?: string;
  date?: string;
  title: string;
  description: string; // Ementa
  author: UserProfile;
  proposingInstitution?: string;
  matterType?: string;
  fullText?: string;
  attachments?: { name: string; url: string }[];
  votingRules: VotingRules;
  turns?: 'Turno Único' | '2 Turnos' | '3 Turnos';
  secretVote?: boolean;
  amendments?: Amendment[];
  votingStatus: 'pending' | 'approved' | 'rejected' | 'annulled';
  workflowStatus: ProjectWorkflowStatus;
  projectPhase?: 'Expediente' | 'Ordem do Dia';
  assignedCommissionIds?: string[];
  pareceres?: Parecer[];
  readInSessionId?: string;
  votedInSessionId?: string;
  transmittalHistory?: TransmittalHistoryEntry[];
  parentProjectId?: string;
  blockVotedProjectIds?: string[];
}

export enum VoteOption {
  SIM = 'SIM',
  NAO = 'NÃO',
  ABS = 'ABS',
}

export type Votes = {
  [vereadorId: string]: VoteOption;
};

export enum PanelView {
  OFF = 'off',
  VOTING = 'voting',
  SPEAKER = 'speaker',
  PRESENCE = 'presence',
  MESSAGE = 'message',
  READING = 'reading',
}

export interface ChatMessage {
    timestamp: number;
    user: Pick<UserProfile, 'uid' | 'name' | 'role'>;
    message: string;
}

export interface SessionState {
  id: string;
  status: 'inactive' | 'active' | 'finished';
  phase: 'Inactive' | 'Expediente' | 'Ordem do Dia';
  panelView: PanelView;
  panelMessage: string | null;
  presence: { [vereadorId: string]: boolean };
  currentProject: Project | null;
  votingOpen: boolean;
  votes: Votes;
  votingResult: string | null;
  speakerQueue: UserProfile[];
  currentSpeaker: UserProfile | null;
  speakerTimerEndTime: number | null;
  speakerTimerPaused: boolean;
  speakerHistory: { speaker: UserProfile, duration: number }[];
  defaultSpeakerDuration: number;
  interruptionRequest: { from: UserProfile; active: boolean } | null;
  pointOfOrderRequest: { from: UserProfile; active: boolean } | null;
  operationalChat: ChatMessage[];
  microphoneStatus: { [vereadorId: string]: boolean };
  isSymbolicVoting: boolean;
  verificationRequest: { from: UserProfile; active: boolean } | null;
}

export interface SessionHistory extends Omit<SessionState, 'id' | 'status' | 'presence'> {
    sessionId: string;
    date: string;
    finalPresence: string[];
    votingRecords: { projectTitle: string, result: string, votes: Votes }[];
    ataDraftContent?: string;
}

export interface PublishedAta {
    id: string;
    sessionId: string;
    date: string;
    title: string;
    content: string; // The formatted, official text of the minutes
}

export interface Commission {
    id: string;
    name: string;
    description: string;
    members: { profile: UserProfile, role: 'Presidente' | 'Relator' | 'Membro' }[];
}