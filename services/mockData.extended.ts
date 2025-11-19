
import {
  Project,
  Party,
  Commission,
  LegislatureConfig,
  SessionHistory,
  MajorityType,
  VotingType,
  UserRole,
  VoteOption,
  ProjectPhase,
  ProjectWorkflowStatus
} from '../types';
import { MOCK_USERS } from './mockData';

const vereadores = MOCK_USERS.filter(u => u.role === UserRole.VEREADOR || u.role === UserRole.PRESIDENTE);

export const MOCK_PARTIES: Party[] = [
  { id: 'party-1', name: 'Progressistas', acronym: 'PP' },
  { id: 'party-2', name: 'Movimento Democrático Brasileiro', acronym: 'MDB' },
  { id: 'party-3', name: 'Partido da Social Democracia Brasileira', acronym: 'PSDB' },
  { id: 'party-4', name: 'Partido Socialista Brasileiro', acronym: 'PSB' },
  { id: 'party-5', name: 'União Brasil', acronym: 'UB' },
  { id: 'party-6', name: 'Podemos', acronym: 'PODE' },
];

export const MOCK_LEGISLATURE_CONFIG: LegislatureConfig = {
    id: 'leg-2024-2028',
    cityName: 'Exemplo',
    totalMembers: 12,
    quorumToOpen: 7,
    votingQuorum: 7,
    startDate: '2024-01-01',
    endDate: '2028-12-31',
};

export const MOCK_COMMISSIONS: Commission[] = [
    {
        id: 'ccj',
        name: 'Comissão de Constituição e Justiça (CCJ)',
        description: 'Analisa a constitucionalidade e legalidade dos projetos.',
        members: [
            { profile: vereadores[0], role: 'Presidente' },
            { profile: vereadores[1], role: 'Relator' },
            { profile: vereadores[2], role: 'Membro' },
        ],
    },
    {
        id: 'cfo',
        name: 'Comissão de Finanças e Orçamento (CFO)',
        description: 'Analisa os aspectos financeiros e orçamentários.',
        members: [
            { profile: vereadores[3], role: 'Presidente' },
            { profile: vereadores[4], role: 'Relator' },
            { profile: vereadores[5], role: 'Membro' },
        ],
    },
     {
        id: 'coe',
        name: 'Comissão de Obras e Educação',
        description: 'Analisa projetos relacionados a obras, serviços públicos, educação, saúde e assistência social.',
        members: [
            { profile: MOCK_USERS.find(u => u.uid === 'vereador-7')!, role: 'Presidente' },
            { profile: vereadores[7], role: 'Relator' },
            { profile: vereadores[8], role: 'Membro' },
        ],
    },
];

export const MOCK_PROJECTS: Project[] = [
    {
        id: 'proj-001',
        number: '001/2024',
        date: '2024-07-01T10:00:00Z',
        title: 'PL - Institui o Dia Municipal do Voluntariado',
        description: 'Fica instituído o Dia Municipal do Voluntariado, a ser comemorado anualmente em 28 de agosto.',
        author: MOCK_USERS.find(u => u.uid === 'vereador-1')!,
        matterType: 'PROJETO DE LEI LEGISLATIVO',
        workflowStatus: ProjectWorkflowStatus.PRONTO_PARA_PAUTA,
        projectPhase: ProjectPhase.EXPEDIENTE,
        votingRules: { type: VotingType.NOMINAL, majority: MajorityType.SIMPLES },
        votingStatus: 'pending',
        assignedCommissionIds: ['ccj', 'coe'],
        transmittalHistory: [
            { date: '2024-07-01T10:00:00Z', event: 'Projeto protocolado.', author: 'Secretaria' },
            { date: '2024-07-02T14:00:00Z', event: 'Enviado para as comissões.', author: 'Secretaria' },
            { date: '2024-07-05T16:00:00Z', event: 'Parecer favorável da CCJ emitido.', author: 'IRMÃO BETO' },
            { date: '2024-07-08T11:00:00Z', event: 'Pronto para inclusão na pauta.', author: 'Secretaria' },
        ],
        pareceres: [
            {
                id: 'par-001',
                date: '2024-07-05T16:00:00Z',
                commissionId: 'ccj',
                commissionName: 'Comissão de Constituição e Justiça (CCJ)',
                author: MOCK_USERS.find(u => u.uid === 'vereador-2')!,
                content: 'O projeto se mostra constitucional e legal.',
                status: 'Favorável',
            },
        ],
        amendments: [],
    },
    {
        id: 'proj-002',
        number: '002/2024',
        date: '2024-07-03T10:00:00Z',
        title: 'REQ - Informações sobre obras na Av. Principal',
        description: 'Requer ao Poder Executivo informações detalhadas sobre o andamento e previsão de término das obras na Avenida Principal.',
        author: MOCK_USERS.find(u => u.uid === 'vereador-5')!,
        matterType: 'REQUERIMENTO',
        workflowStatus: ProjectWorkflowStatus.PRONTO_PARA_PAUTA,
        projectPhase: ProjectPhase.EXPEDIENTE,
        votingRules: { type: VotingType.SIMBOLICA, majority: MajorityType.SIMPLES },
        votingStatus: 'pending',
        transmittalHistory: [
            { date: '2024-07-03T10:00:00Z', event: 'Requerimento protocolado.', author: 'Secretaria' },
            { date: '2024-07-03T11:00:00Z', event: 'Pronto para inclusão na pauta.', author: 'Secretaria' },
        ],
        amendments: [],
        pareceres: [],
    },
    {
        id: 'proj-003',
        number: '003/2024',
        date: '2024-07-10T15:00:00Z',
        title: 'PL - Altera o Código Tributário Municipal',
        description: 'Altera dispositivos da Lei Complementar nº 123, de 2010, que institui o Código Tributário do Município de Exemplo.',
        author: MOCK_USERS.find(u => u.role === UserRole.PUBLICO)!,
        proposingInstitution: 'EXECUTIVO MUNICIPAL',
        matterType: 'PROJETO DE LEI DO EXECUTIVO',
        workflowStatus: ProjectWorkflowStatus.NAS_COMISSOES,
        assignedCommissionIds: ['ccj', 'cfo'],
        votingRules: { type: VotingType.NOMINAL, majority: MajorityType.ABSOLUTA },
        votingStatus: 'pending',
        transmittalHistory: [
            { date: '2024-07-10T15:00:00Z', event: 'Projeto protocolado.', author: 'Executivo' },
            { date: '2024-07-11T09:00:00Z', event: 'Enviado para as comissões.', author: 'Secretaria' },
        ],
        amendments: [],
        pareceres: [],
    },
    {
        id: 'proj-004',
        number: '004/2024',
        date: '2024-07-12T10:00:00Z',
        title: 'PDL - Concede Título de Cidadão Honorário',
        description: 'Concede o Título de Cidadão Honorário de Exemplo ao Sr. Fulano de Tal pelos relevantes serviços prestados à comunidade.',
        author: MOCK_USERS.find(u => u.uid === 'vereador-8')!,
        matterType: 'PROJETO DE DECRETO LEGISLATIVO',
        workflowStatus: ProjectWorkflowStatus.PRONTO_PARA_PAUTA,
        projectPhase: ProjectPhase.ORDEM_DO_DIA,
        votingRules: { type: VotingType.NOMINAL, majority: MajorityType.QUALIFICADA },
        votingStatus: 'pending',
        transmittalHistory: [
            { date: '2024-07-12T10:00:00Z', event: 'Projeto protocolado.', author: 'Secretaria' },
        ],
        amendments: [],
        pareceres: [],
    },
];

export const MOCK_SESSION_HISTORY: SessionHistory[] = [
    {
        sessionId: 'sess-1627884000000',
        date: '2024-07-20T14:00:00Z',
        finalPresence: MOCK_USERS.filter(u => u.role !== UserRole.PUBLICO && u.uid !== 'vereador-12').map(u => u.uid),
        votingRecords: [
            {
                projectTitle: 'Requerimento - Solicita informações sobre obras na Av. Principal',
                result: 'APROVADO POR UNANIMIDADE',
                votes: {
                    'vereador-1': VoteOption.SIM,
                    'vereador-2': VoteOption.SIM,
                    'vereador-3': VoteOption.SIM,
                    'vereador-4': VoteOption.SIM,
                    'vereador-5': VoteOption.SIM,
                    'vereador-6': VoteOption.SIM,
                    'vereador-7': VoteOption.SIM,
                    'vereador-8': VoteOption.SIM,
                    'vereador-9': VoteOption.SIM,
                    'vereador-10': VoteOption.SIM,
                    'vereador-11': VoteOption.SIM,
                }
            }
        ],
        ataDraftContent: `
ATA DA 807ª SESSÃO ORDINÁRIA DA CÂMARA MUNICIPAL DE EXEMPLO

Data: 20 de julho de 2024
Início: 14:00

VEREADORES PRESENTES:
- IRMÃO BETO
- FRANCIS DE GINALDO
- SARGENTO VAL
- MANOEL DO POSTO
- JULIANA VIDAL
- DEL DO MERCADINHO
- JOÃO OLÍMPIO (Presidente)
- DANIEL MIGUEL
- JOÃO SUFOCO
- LÊDO
- CHICO DO POVO

DELIBERAÇÕES:
1. Requerimento - Solicita informações sobre obras na Av. Principal: Aprovado por Unanimidade.

Nada mais havendo a tratar, o Presidente encerrou a sessão.
        `.trim(),
    }
];
