
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { LogOut, Monitor, Users, Vote, Mic, XCircle, AlertTriangle, Send, Edit, FileText, ArrowUp, ArrowDown, Save, Upload } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { PanelView, VoteOption, Project } from '../types';
import { OperationalChat } from '../components/common/OperationalChat';

const ControladorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { 
        session, councilMembers, 
        legislatureConfig, projects,
        togglePresence, setPanelView, hideVoting, setPanelMessage, setCurrentProject,
        overrideVote
    } = useSession();
    const panelWindow = useRef<Window | null>(null);
    const [message, setMessage] = useState('');
    const [overrideMember, setOverrideMember] = useState('');
    const [overrideVoteValue, setOverrideVoteValue] = useState<VoteOption | ''>('');
    const [pautaTab, setPautaTab] = useState<'Expediente' | 'Ordem do Dia'>('Expediente');
    const [feedback, setFeedback] = useState('');

    const projetosPauta = useMemo(() => projects.filter(p => p.workflowStatus === 'Pronto para Pauta'), [projects]);
    const projetosExpedienteOriginal = useMemo(() => projetosPauta.filter(p => p.projectPhase === 'Expediente'), [projetosPauta]);
    const projetosOrdemDoDiaOriginal = useMemo(() => projetosPauta.filter(p => p.projectPhase === 'Ordem do Dia'), [projetosPauta]);

    const [expedienteOrdenado, setExpedienteOrdenado] = useState<Project[]>([]);
    const [ordemDoDiaOrdenada, setOrdemDoDiaOrdenada] = useState<Project[]>([]);
    
    useEffect(() => {
        setExpedienteOrdenado(projetosExpedienteOriginal);
    }, [projetosExpedienteOriginal]);
    
    useEffect(() => {
        setOrdemDoDiaOrdenada(projetosOrdemDoDiaOriginal);
    }, [projetosOrdemDoDiaOriginal]);

    const showFeedback = (message: string) => {
        setFeedback(message);
        setTimeout(() => setFeedback(''), 3000);
    };

    const moveItem = (index: number, direction: 'up' | 'down', list: 'expediente' | 'ordem') => {
        const updater = list === 'expediente' ? setExpedienteOrdenado : setOrdemDoDiaOrdenada;
        updater(currentList => {
            const newList = [...currentList];
            const swapIndex = direction === 'up' ? index - 1 : index + 1;
            if (swapIndex < 0 || swapIndex >= newList.length) return newList;
            [newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]; // Swap
            return newList;
        });
    };

    const PAUTA_STORAGE_KEY = 'sapv-pauta-ordem-controlador';

    const handleSaveOrder = () => {
        const dataToSave = {
            expediente: expedienteOrdenado.map(p => p.id),
            ordemDoDia: ordemDoDiaOrdenada.map(p => p.id)
        };
        localStorage.setItem(PAUTA_STORAGE_KEY, JSON.stringify(dataToSave));
        showFeedback('Ordem da pauta salva localmente!');
    };

    const handleLoadOrder = () => {
        const savedDataString = localStorage.getItem(PAUTA_STORAGE_KEY);
        if (!savedDataString) {
            showFeedback('Nenhuma ordem salva foi encontrada.');
            return;
        }

        const savedData = JSON.parse(savedDataString);
        const savedExpedienteIds: string[] = savedData.expediente || [];
        const savedOrdemDoDiaIds: string[] = savedData.ordemDoDia || [];

        const reorderList = (originalList: Project[], savedIds: string[]): Project[] => {
            const projectMap = new Map(originalList.map(p => [p.id, p]));
            const orderedList: Project[] = [];
            const foundIds = new Set<string>();

            savedIds.forEach(id => {
                const project = projectMap.get(id);
                if (project) {
                    orderedList.push(project);
                    foundIds.add(id);
                }
            });

            originalList.forEach(project => {
                if (!foundIds.has(project.id)) {
                    orderedList.push(project);
                }
            });
            return orderedList;
        };

        setExpedienteOrdenado(reorderList(projetosExpedienteOriginal, savedExpedienteIds));
        setOrdemDoDiaOrdenada(reorderList(projetosOrdemDoDiaOriginal, savedOrdemDoDiaIds));
        showFeedback('Ordem da pauta carregada.');
    };


    const openPanel = () => {
        if (!panelWindow.current || panelWindow.current.closed) {
            const panelUrl = `${window.location.origin}${window.location.pathname}#/panel`;
            panelWindow.current = window.open(panelUrl, 'SMART_LEGIS_Painel', 'width=1280,height=720,menubar=no,toolbar=no,location=no,status=no');
        } else {
            panelWindow.current.focus();
        }
    };
    
    const handleEspelharEmenta = (project: Project) => {
        setCurrentProject(project);
        setPanelView(PanelView.READING);
    }

    const handleSendMessage = () => {
        if (message) {
            setPanelMessage(message);
            setPanelView(PanelView.MESSAGE);
        }
    }
    
    const handleOverrideVote = (e: React.FormEvent) => {
        e.preventDefault();
        if(overrideMember && overrideVoteValue) {
            overrideVote(overrideMember, overrideVoteValue);
            setOverrideMember('');
            setOverrideVoteValue('');
        }
    }
    
    const presentCount = Object.values(session.presence).filter(p => p).length;

    const PresenceListItem: React.FC<{member: typeof councilMembers[0]}> = ({member}) => {
        const isPresent = session.presence[member.uid];
        return (
            <div className={`flex items-center justify-between p-2 rounded ${isPresent ? 'bg-green-900' : 'bg-red-900'} bg-opacity-50`}>
                <span className="text-sm">{member.name}</span>
                <Button size="sm" onClick={() => togglePresence(member.uid)} variant={isPresent ? 'danger' : 'success'}>
                    {isPresent ? 'Ausente' : 'Presente'}
                </Button>
            </div>
        )
    };

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Painel do Controlador (Técnico)</h1>
                    <p className="text-sapv-gray">Operador: {user?.name}</p>
                </div>
                <Button onClick={logout} variant="danger">
                    <LogOut className="inline-block mr-2" size={16} /> Sair
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna 1: Pauta e Presença */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Pauta da Sessão">
                         <div className="flex border-b border-sapv-gray-dark mb-2">
                            <button onClick={() => setPautaTab('Expediente')} className={`px-4 py-2 text-sm font-semibold ${pautaTab === 'Expediente' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>Expediente</button>
                            <button onClick={() => setPautaTab('Ordem do Dia')} className={`px-4 py-2 text-sm font-semibold ${pautaTab === 'Ordem do Dia' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>Ordem do Dia</button>
                        </div>
                        <div className="flex justify-end items-center gap-2 mb-2 border-b border-sapv-gray-dark pb-2">
                            {feedback && <span className="text-xs text-green-400 mr-auto">{feedback}</span>}
                            <Button size="sm" variant="secondary" onClick={handleSaveOrder}><Save size={14} className="mr-1"/> Salvar Ordem</Button>
                            <Button size="sm" variant="secondary" onClick={handleLoadOrder}><Upload size={14} className="mr-1"/> Carregar Ordem</Button>
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                           {(pautaTab === 'Expediente' ? expedienteOrdenado : ordemDoDiaOrdenada).map((p, index) => (
                               <div key={p.id} className="bg-sapv-blue-dark p-2 rounded flex items-center justify-between">
                                   <div className="flex-grow">
                                       <p className="text-sm font-semibold">{p.title}</p>
                                       <Button size="sm" variant="secondary" className="w-full mt-1 text-xs" onClick={() => handleEspelharEmenta(p)}>
                                           <FileText size={12} className="mr-1"/> Espelhar Ementa no Painel
                                       </Button>
                                   </div>
                                    <div className="flex flex-col ml-2">
                                        <button onClick={() => moveItem(index, 'up', pautaTab === 'Expediente' ? 'expediente' : 'ordem')} disabled={index === 0} className="disabled:opacity-20 text-sapv-gray hover:text-sapv-highlight"><ArrowUp size={18}/></button>
                                        <button onClick={() => moveItem(index, 'down', pautaTab === 'Expediente' ? 'expediente' : 'ordem')} disabled={index === (pautaTab === 'Expediente' ? expedienteOrdenado.length - 1 : ordemDoDiaOrdenada.length - 1)} className="disabled:opacity-20 text-sapv-gray hover:text-sapv-highlight"><ArrowDown size={18}/></button>
                                    </div>
                               </div>
                           ))}
                        </div>
                    </Card>
                     <Card title="Presença (Override Manual)">
                         <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
                            {councilMembers.map(m => <PresenceListItem key={m.uid} member={m} />)}
                        </div>
                         <p className="text-xs text-center mt-2 text-sapv-gray">Total: {presentCount}/{legislatureConfig.totalMembers}</p>
                    </Card>
                </div>

                {/* Coluna 2: Controle do Painel e Overrides */}
                <div className="lg:col-span-1 space-y-6">
                     <Card title="Controle do Painel Eletrônico">
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={openPanel} className="col-span-2">
                                <Monitor className="inline-block mr-2" size={16} /> Abrir/Focar Painel
                            </Button>
                             <Button onClick={() => setPanelView(PanelView.READING)} variant='secondary' disabled={!session.currentProject}>
                                <FileText className="inline-block mr-2" size={16} /> Ver Leitura
                            </Button>
                            <Button onClick={() => setPanelView(PanelView.PRESENCE)} variant='secondary'>
                                <Users className="inline-block mr-2" size={16} /> Ver Presença
                            </Button>
                             <Button onClick={() => setPanelView(session.currentProject ? PanelView.VOTING : PanelView.OFF)} variant='secondary' disabled={!session.currentProject}>
                                <Vote className="inline-block mr-2" size={16} /> Ver Votação
                            </Button>
                             <Button onClick={() => setPanelView(session.currentSpeaker ? PanelView.SPEAKER : PanelView.OFF)} variant='secondary' disabled={!session.currentSpeaker}>
                                <Mic className="inline-block mr-2" size={16} /> Ver Tribuna
                            </Button>
                             <Button onClick={() => setPanelView(PanelView.OFF)} variant='secondary' className="col-span-2">
                                <XCircle className="inline-block mr-2" size={16} /> Painel em Espera
                            </Button>
                             <Button onClick={hideVoting} variant='danger' className="col-span-2">
                                <XCircle className="inline-block mr-2" size={16} /> Limpar Painel (Ocultar Votação)
                            </Button>
                        </div>
                    </Card>
                    <Card title="Votos (Override Manual)">
                        <form onSubmit={handleOverrideVote} className="space-y-3">
                            <p className="text-xs text-yellow-400"><AlertTriangle size={14} className="inline mr-1"/> Use apenas em caso de falha no terminal.</p>
                            <select value={overrideMember} onChange={e => setOverrideMember(e.target.value)} className="w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Selecione o Vereador</option>
                                {councilMembers.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
                            </select>
                             <select value={overrideVoteValue} onChange={e => setOverrideVoteValue(e.target.value as VoteOption)} className="w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Selecione o Voto</option>
                                {Object.values(VoteOption).map((v) => <option key={v} value={v}>{v}</option>)}
                            </select>
                            <Button type="submit" className="w-full" size="sm" disabled={!overrideMember || !overrideVoteValue}>
                                <Edit size={16} className="mr-2"/> Registrar Voto Manual
                            </Button>
                        </form>
                    </Card>
                </div>
                
                {/* Coluna 3: Status e Comunicação */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Status da Sessão">
                        <div className="space-y-2 text-center">
                            <p className="text-lg">Sessão: <span className={`font-bold ${session.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{session.status.toUpperCase()}</span></p>
                            <p className="text-lg">Fase: <span className="font-bold text-yellow-300">{session.phase.toUpperCase()}</span></p>
                            <p>Projeto em Pauta: <span className="font-bold">{session.currentProject?.title || 'Nenhum'}</span></p>
                            <p>Orador na Tribuna: <span className="font-bold">{session.currentSpeaker?.name || 'Ninguém'}</span></p>
                            <p>Votação: <span className={`font-bold ${session.votingOpen ? 'text-green-400 animate-pulse' : 'text-sapv-gray'}`}>{session.votingOpen ? 'ABERTA' : 'FECHADA'}</span></p>
                        </div>
                    </Card>
                    <Card title="Mensagem de Aviso no Painel">
                        <div className="space-y-3">
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} className="w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" placeholder="Ex: Sessão suspensa por 5 minutos."/>
                            <Button onClick={handleSendMessage} className="w-full" disabled={!message}><Send size={16} className="mr-2"/> Enviar Mensagem</Button>
                            {session.panelView === PanelView.MESSAGE && (
                                <Button onClick={() => setPanelMessage(null)} variant="danger" className="w-full" size="sm">Remover Mensagem</Button>
                            )}
                        </div>
                    </Card>
                    <Card title="Chat Operacional da Mesa" className="flex flex-col h-[300px]">
                        <OperationalChat />
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default ControladorDashboard;
