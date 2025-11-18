import { UserProfile, UserRole, Project, Party, LegislatureConfig, VotingType, MajorityType, SessionHistory, PanelView, VoteOption, Commission } from '../types';

export const MOCK_PARTIES: Party[] = [
    { id: 'pp', name: 'Partido Progressista', acronym: 'PP' },
    { id: 'mdb', name: 'Movimento Democrático Brasileiro', acronym: 'MDB' },
    { id: 'psdb', name: 'Partido da Social Democracia Brasileira', acronym: 'PSDB' },
    { id: 'psb', name: 'Partido Socialista Brasileiro', acronym: 'PSB' },
    { id: 'ub', name: 'União Brasil', acronym: 'UB' },
    { id: 'pode', name: 'Podemos', acronym: 'PODE' },
    { id: 'republicanos', name: 'Republicanos', acronym: 'REPUBLICANOS' },
    { id: 'psd', name: 'Partido Social Democrático', acronym: 'PSD' },
];

export const MOCK_LEGISLATURE_CONFIG: LegislatureConfig = {
    totalMembers: 12,
    quorumToOpen: 5, // 1/3 of 12 + 1
    votingQuorum: 7, // 50% + 1 of 12
    startDate: '2021-01-01',
    endDate: '2024-12-31',
};


export const MOCK_USERS: UserProfile[] = [
  { uid: 'user-controlador', name: 'Operador Técnico', party: 'ADM', role: UserRole.CONTROLADOR, email: 'controlador@sapv.gov' },
  { uid: 'user-secretaria', name: 'Secretário Legislativo', party: 'ADM', role: UserRole.SECRETARIA, email: 'secretaria@sapv.gov' },
  { uid: 'user-publico', name: 'Cidadão Observador', party: 'N/A', role: UserRole.PUBLICO, email: 'publico@sapv.gov' },

  { uid: 'user-presidente', name: 'IRMÃO BETO', party: 'PP', role: UserRole.PRESIDENTE, email: 'presidente@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=user-presidente' },
  { uid: 'vereador-1', name: 'FRANCIS DE GINALDO', party: 'MDB', role: UserRole.VEREADOR, email: 'francis.ginaldo@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-1', boardRole: 'VICE' },
  { uid: 'vereador-2', name: 'SARGENTO VAL', party: 'MDB', role: UserRole.VEREADOR, email: 'sargento.val@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-2' },
  { uid: 'vereador-3', name: 'MANOEL DO POSTO', party: 'PP', role: UserRole.VEREADOR, email: 'manoel.posto@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-3', boardRole: '1ºSEC' },
  { uid: 'vereador-4', name: 'JULIANA VIDAL', party: 'PP', role: UserRole.VEREADOR, email: 'juliana.vidal@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-4' },
  { uid: 'vereador-5', name: 'DEL DO MERCADINHO', party: 'PSDB', role: UserRole.VEREADOR, email: 'del.mercadinho@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-5', boardRole: '2ºSEC' },
  { uid: 'vereador-6', name: 'JOÃO OLÍMPIO', party: 'PSB', role: UserRole.VEREADOR, email: 'joao.olimpio@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-6' },
  { uid: 'vereador-7', name: 'DANIEL MIGUEL', party: 'PSDB', role: UserRole.VEREADOR, email: 'daniel.miguel@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-7' },
  { uid: 'vereador-8', name: 'JOÃO SUFOCO', party: 'UB', role: UserRole.VEREADOR, email: 'joao.sufoco@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-8' },
  { uid: 'vereador-9', name: 'LÊDO', party: 'PSDB', role: UserRole.VEREADOR, email: 'ledo@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-9' },
  { uid: 'vereador-10', name: 'CHICO DO POVO', party: 'MDB', role: UserRole.VEREADOR, email: 'chico.povo@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-10' },
  { uid: 'vereador-11', name: 'ADRIANO FERREIRA', party: 'PODE', role: UserRole.VEREADOR, email: 'adriano.ferreira@sapv.gov', photoUrl: 'https://i.pravatar.cc/150?u=vereador-11' },
];

export const getVereadores = (): UserProfile[] => MOCK_USERS.filter(u => u.role === UserRole.VEREADOR || u.role === UserRole.PRESIDENTE);
const vereadores = getVereadores();

export const MOCK_COMMISSIONS: Commission[] = [
    {
        id: 'ccj',
        name: 'Comissão de Constituição e Justiça (CCJ)',
        description: 'Analisa a constitucionalidade e legalidade dos projetos.',
        members: [
            { profile: vereadores[1], role: 'Presidente' },
            { profile: vereadores[3], role: 'Relator' },
            { profile: vereadores[8], role: 'Membro' },
        ],
    },
    {
        id: 'cfo',
        name: 'Comissão de Finanças e Orçamento (CFO)',
        description: 'Analisa o impacto financeiro e orçamentário dos projetos.',
        members: [
            { profile: vereadores[4], role: 'Presidente' },
            { profile: vereadores[9], role: 'Relator' },
            { profile: vereadores[0], role: 'Membro' },
        ]
    }
];

export const MOCK_PROJECTS: Project[] = [
  { 
    id: 'proj-123', 
    number: '123/2024',
    date: '2024-08-10',
    title: 'PROJETO DE LEI Nº 123/2024', 
    description: 'Dispõe sobre a criação do Parque Municipal das Águas Claras e dá outras providências.', 
    author: vereadores[2], // Dra. Cristiana
    matterType: 'PROJETO DE LEI LEGISLATIVO',
    proposingInstitution: 'CÂMARA MUNICIPAL',
    votingStatus: 'pending',
    workflowStatus: 'Pronto para Pauta',
    projectPhase: 'Ordem do Dia',
    assignedCommissionIds: ['ccj', 'cfo'],
    pareceres: [
        { id: 'par-1', commissionId: 'ccj', commissionName: 'CCJ', author: vereadores[1], status: 'Favorável', content: 'O projeto se mostra constitucional e legal.', date: '2024-08-01' },
        { id: 'par-2', commissionId: 'cfo', commissionName: 'CFO', author: vereadores[4], status: 'Favorável', content: 'Impacto orçamentário adequado e previsto.', date: '2024-08-03' }
    ],
    votingRules: {
      type: VotingType.NOMINAL,
      majority: MajorityType.SIMPLES,
    },
    turns: 'Turno Único',
    secretVote: false,
  },
  { 
    id: 'proj-124', 
    number: '45/2024',
    date: '2024-07-22',
    title: 'PROJETO DE LEI COMPLEMENTAR Nº 45/2024', 
    description: 'Altera o Plano Diretor do Município para incluir novas zonas de desenvolvimento sustentável.', 
    author: vereadores[8], // Marcelo Cubo
    matterType: 'PROJETO DE LEI DO EXECUTIVO',
    proposingInstitution: 'EXECUTIVO MUNICIPAL',
    votingStatus: 'pending',
    workflowStatus: 'Pronto para Pauta',
    projectPhase: 'Ordem do Dia',
    votingRules: {
      type: VotingType.NOMINAL,
      majority: MajorityType.ABSOLUTA,
    },
  },
  { 
    id: 'proj-req-1', 
    number: '101/2024',
    date: '2024-08-11',
    title: 'REQUERIMENTO Nº 101/2024', 
    description: 'Requer informações ao Executivo sobre o cronograma de obras da Av. Principal.', 
    author: vereadores[5],
    matterType: 'REQUERIMENTO',
    votingStatus: 'pending',
    workflowStatus: 'Pronto para Pauta',
    projectPhase: 'Expediente',
    votingRules: {
      type: VotingType.SIMBOLICA,
      majority: MajorityType.SIMPLES,
    },
  },
   { 
    id: 'proj-req-2', 
    number: '102/2024',
    date: '2024-08-11',
    title: 'REQUERIMENTO Nº 102/2024', 
    description: 'Solicita a poda de árvores na Rua das Flores.', 
    author: vereadores[7],
    matterType: 'REQUERIMENTO',
    votingStatus: 'pending',
    workflowStatus: 'Pronto para Pauta',
    projectPhase: 'Expediente',
    votingRules: {
      type: VotingType.SIMBOLICA,
      majority: MajorityType.SIMPLES,
    },
  },
   { 
    id: 'proj-sub-1', 
    number: '01/2024 (SUB)',
    date: '2024-08-15',
    title: 'SUBSTITUTIVO AO PROJETO DE LEI Nº 123/2024', 
    description: 'Substitui integralmente o projeto original, propondo a concessão da área para iniciativa privada.', 
    author: vereadores[9],
    parentProjectId: 'proj-123',
    matterType: 'SUBSTITUTIVO',
    votingStatus: 'pending',
    workflowStatus: 'Pronto para Pauta',
    projectPhase: 'Ordem do Dia',
    votingRules: {
      type: VotingType.NOMINAL,
      majority: MajorityType.SIMPLES,
    },
  },
];

export const MOCK_SESSION_HISTORY: SessionHistory[] = [
    {
        sessionId: 'session-1',
        date: '2024-08-01T10:00:00Z',
        finalPresence: getVereadores().slice(0, 10).map(v => v.uid),
        votingRecords: [
            { projectTitle: 'PROJETO DE LEI Nº 120/2024', result: 'APROVADO POR MAIORIA SIMPLES', votes: {
                'vereador-1': VoteOption.SIM,
                'vereador-2': VoteOption.SIM,
                'vereador-3': VoteOption.NAO,
            } }
        ],
        phase: 'Ordem do Dia',
        panelView: PanelView.OFF,
        panelMessage: null,
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
    }
];