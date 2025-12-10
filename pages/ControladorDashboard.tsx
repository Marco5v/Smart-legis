import React, { useState, useEffect } from 'react';
import { LogOut, Monitor, Users, Vote, Mic, XCircle, AlertTriangle, Send, Edit, FileText, ArrowUp, ArrowDown, Save, Upload, Zap } from 'lucide-react';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { PanelView, VoteOption, Project, SessionPhase, UserRole, ProjectPhase } from '../types';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { OperationalChat } from '../components/common/OperationalChat';

const ControladorDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { 
        session, councilMembers, legislatureConfig, projects,
        togglePresence, setPanelView, hideVoting, setPanelMessage, setCurrentProject,
        overrideVote, setVotingStatus, castVote
    } = useSession();
    
    const [message, setMessage] = useState('');
    const [overrideMember, setOverrideMember] = useState('');
    const [overrideVoteValue, setOverrideVoteValue] = useState<VoteOption | ''>('');
    const [pautaTab, setPautaTab] = useState<'Expediente' | 'Ordem do Dia'>('Expediente');
    const [feedback, setFeedback] = useState('');

    // Estado local para ordenação da pauta, inicializado com os projetos do contexto
    const [expedienteOrdenado, setExpedienteOrdenado] = useState<Project[]>([]);
    const [ordemDoDiaOrdenada, setOrdemDoDiaOrdenada] = useState<Project[]>([]);

    useEffect(() => {
        setExpedienteOrdenado(projects.filter(p => p.projectPhase === ProjectPhase.EXPEDIENTE));
        setOrdemDoDiaOrdenada(projects.filter(p => p.projectPhase === ProjectPhase.ORDEM_DO_DIA));
    }, [projects]);

    const showFeedback = (msg: string) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

    const handleSendMessage = () => { 
        if (message) { 
            setPanelMessage(message); 
            setPanelView(PanelView.MESSAGE); 
            showFeedback('Mensagem enviada ao painel'); 
        } 
    };
    
    const handleOverrideVote = (e: React.FormEvent) => { 
        e.preventDefault(); 
        if(overrideMember && overrideVoteValue && user) { 
            overrideVote(overrideMember, overrideVoteValue, user.name); 
            setOverrideMember(''); 
            setOverrideVoteValue(''); 
            showFeedback('Voto manual registrado.');
        } 
    };

    const handleEspelharEmenta = (project: Project) => { 
        setCurrentProject(project); 
        // setCurrentProject já seta o PanelView para READING no contexto, mas reforçamos:
        setPanelView(PanelView.READING); 
        showFeedback(`Espelhando: ${project.title}`);
    };

    const moveItem = (index: number, direction: 'up' | 'down', list: 'expediente' | 'ordem') => {
        const updater = list === 'expediente' ? setExpedienteOrdenado : setOrdemDoDiaOrdenada;
        updater(prev => {
            const newList = [...prev];
            if (direction === 'up' && index > 0) {
                [newList[index], newList[index - 1]] = [newList[index - 1], newList[index]];
            } else if (direction === 'down' && index < newList.length - 1) {
                [newList[index], newList[index + 1]] = [newList[index + 1], newList[index]];
            }
            return newList;
        });
        showFeedback('Item reordenado');
    };

    // --- SIMULADOR DE MESA ---
    const handleSimulateRandomVotes = () => {
        if (!session.votingOpen) { showFeedback('A votação precisa estar aberta para simular votos.'); return; }
        let votesCount = 0;
        councilMembers.forEach(member => {
            if (session.presence[member.uid] && !session.votes[member.uid]) {
                const random = Math.random();
                let vote = VoteOption.SIM;
                if (random > 0.7) vote = VoteOption.NAO;
                else if (random > 0.9) vote = VoteOption.ABS;
                // Simulamos o voto vindo do próprio usuário para fins de teste
                castVote(member.uid, vote, "Simulador de Mesa");
                votesCount++;
            }
        });
        showFeedback(`${votesCount} votos aleatórios computados.`);
    };

    const PresenceListItem: React.FC<{member: typeof councilMembers[0]}> = ({member}) => {
        const isPresent = session.presence[member.uid];
        return ( 
            <div className={`flex items-center justify-between p-2 rounded mb-1 ${isPresent ? 'bg-green-900/30 border border-green-800' : 'bg-red-900/30 border border-red-800'}`}> 
                <span className="text-sm text-gray-300">{member.name}</span> 
                <Button size="sm" onClick={() => togglePresence(member.uid)} variant={isPresent ? 'danger' : 'success'} className="text-xs py-0.5 h-6"> 
                    {isPresent ? 'Ausente' : 'Presente'} 
                </Button> 
            </div> 
        )
    };

    const presentCount = Object.values(session.presence).filter(p => p).length;

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-6 font-sans">
            <header className="flex justify-between items-center mb-8 border-b border-sapv-gray-dark pb-4">
                <div> 
                    <h1 className="text-2xl font-bold text-white">Painel do Controlador (Técnico)</h1> 
                    <p className="text-gray-400 text-sm">Operador: {user?.name}</p> 
                </div>
                <Button onClick={logout} variant="danger"> <LogOut className="inline-block mr-2" size={16} /> Sair </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* COLUNA 1: PAUTA */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Pauta da Sessão">
                        <div className="flex border-b border-sapv-gray-dark mb-2">
                            <button onClick={() => setPautaTab('Expediente')} className={`px-4 py-2 text-sm font-semibold transition-colors ${pautaTab === 'Expediente' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Expediente</button>
                            <button onClick={() => setPautaTab('Ordem do Dia')} className={`px-4 py-2 text-sm font-semibold transition-colors ${pautaTab === 'Ordem do Dia' ? 'border-b-2 border-blue-500 text-blue-400' : 'text-gray-500 hover:text-gray-300'}`}>Ordem do Dia</button>
                        </div>
                        <div className="flex justify-end gap-2 mb-2 pb-2 border-b border-sapv-gray-dark">
                             {feedback && <span className="text-xs text-green-400 mr-auto self-center animate-pulse">{feedback}</span>}
                             <Button size="sm" variant="secondary"><Save size={14} className="mr-1"/> Salvar</Button>
                        </div>
                        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                           {(pautaTab === 'Expediente' ? expedienteOrdenado : ordemDoDiaOrdenada).map((p, index) => (
                               <div key={p.id} className={`p-3 rounded border transition-colors ${session.currentProject?.id === p.id ? 'bg-blue-900/30 border-blue-500' : 'bg-gray-800 border-sapv-gray-dark'}`}>
                                   <div className="flex justify-between items-start">
                                       <div>
                                            <p className="text-xs font-bold text-gray-300 line-clamp-2">{p.title}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">{p.matterType}</p>
                                       </div>
                                       <div className="flex flex-col gap-1 ml-2">
                                            <button onClick={() => moveItem(index, 'up', pautaTab === 'Expediente' ? 'expediente' : 'ordem')} className="text-gray-500 hover:text-white"><ArrowUp size={14}/></button>
                                            <button onClick={() => moveItem(index, 'down', pautaTab === 'Expediente' ? 'expediente' : 'ordem')} className="text-gray-500 hover:text-white"><ArrowDown size={14}/></button>
                                       </div>
                                   </div>
                                   <Button size="sm" variant="secondary" className="w-full mt-2 text-xs flex items-center justify-center gap-2" onClick={() => handleEspelharEmenta(p)}> 
                                        <FileText size={12}/> Espelhar Ementa 
                                   </Button>
                               </div>
                           ))}
                           {(pautaTab === 'Expediente' ? expedienteOrdenado : ordemDoDiaOrdenada).length === 0 && (
                               <p className="text-xs text-center text-gray-500 py-4">Nenhum projeto nesta fase.</p>
                           )}
                        </div>
                    </Card>
                    <Card title="Presença Manual"> 
                        <div className="space-y-1 max-h-60 overflow-y-auto pr-1"> 
                            {councilMembers.map(m => <PresenceListItem key={m.uid} member={m} />)} 
                        </div> 
                        <p className="text-xs text-center mt-2 text-gray-500">Total: {presentCount}/{legislatureConfig.totalMembers}</p> 
                    </Card>
                </div>

                {/* COLUNA 2: CONTROLES */}
                <div className="lg:col-span-1 space-y-6">
                     <Card title="Controle do Painel Eletrônico">
                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={() => window.open('/#/panel', 'SMART_LEGIS_Painel', 'width=1280,height=720')} className="col-span-2 bg-blue-700 hover:bg-blue-600 py-3"> <Monitor className="inline-block mr-2" size={18} /> Abrir/Focar Painel </Button>
                            
                            <div className="col-span-2 h-px bg-sapv-gray-dark my-1"></div>
                            
                            <Button onClick={() => setPanelView(PanelView.READING)} variant='secondary' disabled={!session.currentProject}> <FileText className="inline-block mr-2" size={16} /> Ver Leitura </Button>
                            <Button onClick={() => setPanelView(PanelView.PRESENCE)} variant='secondary'> <Users className="inline-block mr-2" size={16} /> Ver Presença </Button>
                            <Button onClick={() => setPanelView(PanelView.VOTING)} variant='secondary'> <Vote className="inline-block mr-2" size={16} /> Ver Votação </Button>
                            <Button onClick={() => setPanelView(PanelView.SPEAKER)} variant='secondary'> <Mic className="inline-block mr-2" size={16} /> Ver Tribuna </Button>
                            
                            <div className="col-span-2 h-px bg-sapv-gray-dark my-1"></div>

                            <Button onClick={() => setPanelView(PanelView.OFF)} variant='secondary' className="col-span-2"> <XCircle className="inline-block mr-2" size={16} /> Painel em Espera </Button>
                            
                            {/* Botões de Votação */}
                            <div className="col-span-2 bg-gray-900/50 p-3 rounded border border-sapv-gray-dark mt-2">
                                <p className="text-xs text-gray-400 mb-2 font-bold uppercase text-center">Controle de Votação</p>
                                <div className="flex gap-2">
                                    <Button onClick={() => setVotingStatus(true)} variant="success" className="flex-1 py-3" disabled={!session.currentProject || session.votingOpen}>
                                        Iniciar
                                    </Button>
                                    <Button onClick={() => setVotingStatus(false)} variant="danger" className="flex-1 py-3" disabled={!session.votingOpen}>
                                        Encerrar
                                    </Button>
                                </div>
                            </div>

                            <Button onClick={hideVoting} variant='secondary' className="col-span-2 mt-1 text-xs"> Limpar Votação (Ocultar) </Button>
                        </div>
                    </Card>

                    {/* SIMULADOR DE MESA */}
                    <Card title="Simulador de Mesa (Testes)">
                        <div className="space-y-3">
                            <p className="text-xs text-gray-400">Use para testar o sistema sem vereadores reais logados.</p>
                            <Button onClick={handleSimulateRandomVotes} className="w-full bg-purple-700 hover:bg-purple-600 border border-purple-500" disabled={!session.votingOpen}>
                                <Zap size={16} className="mr-2"/> Computar Votos Aleatórios
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* COLUNA 3: STATUS E OVERRIDE */}
                <div className="lg:col-span-1 space-y-6">
                    <Card title="Status da Sessão">
                        <div className="space-y-4 text-center py-2">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Estado</p>
                                <p className={`text-xl font-bold ${session.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>{session.status.toUpperCase()}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Matéria Atual</p>
                                <p className="font-bold text-white line-clamp-2">{session.currentProject?.title || 'Nenhum'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Votação</p>
                                <p className={`text-xl font-bold ${session.votingOpen ? 'text-green-400 animate-pulse' : 'text-gray-400'}`}>{session.votingOpen ? 'ABERTA' : 'FECHADA'}</p>
                            </div>
                        </div>
                    </Card>

                    <Card title="Mensagem de Aviso">
                        <div className="space-y-3">
                            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3} className="w-full px-3 py-2 text-white bg-gray-900 border border-sapv-gray-dark rounded focus:border-blue-500 focus:outline-none text-sm" placeholder="Ex: Sessão suspensa por 5 minutos."/>
                            <div className="flex gap-2">
                                <Button onClick={handleSendMessage} className="flex-1" disabled={!message}><Send size={16} className="mr-2"/> Enviar</Button>
                                {session.panelView === PanelView.MESSAGE && ( <Button onClick={() => setPanelMessage('')} variant="danger" size="sm"><XCircle size={16}/></Button> )}
                            </div>
                        </div>
                    </Card>

                    <Card title="Override Voto Manual">
                        <form onSubmit={handleOverrideVote} className="space-y-3">
                            <p className="text-xs text-yellow-500 flex items-center"><AlertTriangle size={12} className="mr-1"/> Apenas emergência</p>
                            <select value={overrideMember} onChange={e => setOverrideMember(e.target.value)} className="w-full px-3 py-2 text-white bg-gray-900 border border-sapv-gray-dark rounded text-sm"> 
                                <option value="">Selecione Vereador</option> 
                                {councilMembers.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)} 
                            </select>
                            <select value={overrideVoteValue} onChange={e => setOverrideVoteValue(e.target.value as VoteOption)} className="w-full px-3 py-2 text-white bg-gray-900 border border-sapv-gray-dark rounded text-sm"> 
                                <option value="">Selecione Voto</option> 
                                {Object.values(VoteOption).map((v) => <option key={v} value={v}>{v}</option>)} 
                            </select>
                            <Button type="submit" className="w-full" size="sm" disabled={!overrideMember || !overrideVoteValue}> <Edit size={16} className="mr-2"/> Registrar </Button>
                        </form>
                    </Card>
                    
                    <Card title="Chat Operacional" className="h-48 flex flex-col">
                        <OperationalChat />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ControladorDashboard;