import React, { useMemo, useState, useEffect, useRef } from 'react';
import { LogOut, Play, Vote, Mic, SkipForward, XCircle, Users, Pause, Plus, RotateCcw, Ban, AlertTriangle, CheckCircle, X, HelpCircle, FileText, MessageSquare, MicOff, Layers, CheckSquare as CheckSquareIcon, GripVertical, Save, Upload } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { Project, PanelView, VotingType, MajorityType } from '../types';
import { OperationalChat } from '../components/common/OperationalChat';

// FIX: Made ProjectWithChildren recursive to correctly type the project hierarchy.
type ProjectWithChildren = Project & { children: ProjectWithChildren[] };


const PresidenteDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { 
        session, projects, setVotingStatus, 
        advanceSpeakerQueue, setSpeakerTimer, legislatureConfig,
        startSession, endSession, calculateResult, restartVoting,
        annulVoting, pauseSpeakerTimer, addSpeakerTime, resolveInterruption, setCurrentProject,
        resolvePointOfOrder, setPhase, toggleMicrophone, muteAllMicrophones,
        startSymbolicVoting, resolveSymbolicVote, resolveVerification,
        councilMembers, setDefaultSpeakerDuration
    } = useSession();
    
    const [selectedBlockItems, setSelectedBlockItems] = useState<Set<string>>(new Set());
    const [pautaTab, setPautaTab] = useState<'Expediente' | 'Ordem do Dia'>('Expediente');
    const [feedback, setFeedback] = useState('');
    const [remainingSpeakerTime, setRemainingSpeakerTime] = useState<number | null>(null);
    const [defaultSpeakerTime, setDefaultSpeakerTime] = useState(session.defaultSpeakerDuration / 60);

    useEffect(() => {
        setDefaultSpeakerTime(session.defaultSpeakerDuration / 60);
    }, [session.defaultSpeakerDuration]);

    // Countdown timer for speaker
    useEffect(() => {
        if (!session.speakerTimerEndTime) {
            setRemainingSpeakerTime(null);
            return;
        }

        const interval = setInterval(() => {
            if (!session.speakerTimerPaused) { // Only update if not paused
                const now = Date.now();
                const diff = session.speakerTimerEndTime - now;
                setRemainingSpeakerTime(Math.max(0, Math.floor(diff / 1000)));
            }
        }, 1000);

        // Initial calculation if not paused
        if (!session.speakerTimerPaused) {
            const now = Date.now();
            const diff = session.speakerTimerEndTime - now;
            setRemainingSpeakerTime(Math.max(0, Math.floor(diff / 1000)));
        }

        return () => clearInterval(interval);
    }, [session.speakerTimerEndTime, session.speakerTimerPaused]);

    const formatTime = (seconds: number | null): string => {
        if (seconds === null) return '00:00';
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };


    // --- State and Logic for Reorderable Pauta ---
    const buildHierarchy = (projectList: Project[]): ProjectWithChildren[] => {
        // FIX: Updated the type of the children array to ProjectWithChildren[] to match the recursive type.
        const projectMap = new Map(projectList.map(p => [p.id, { ...p, children: [] as ProjectWithChildren[] }]));
        const hierarchicalPauta: ProjectWithChildren[] = [];
        projectList.forEach(p => {
            const projectWithChildren = projectMap.get(p.id)!;
            if (p.parentProjectId && projectMap.has(p.parentProjectId)) {
                projectMap.get(p.parentProjectId)?.children.push(projectWithChildren);
            } else {
                hierarchicalPauta.push(projectWithChildren);
            }
        });
        return hierarchicalPauta;
    };

    const projetosPauta = useMemo(() => projects.filter(p => p.workflowStatus === 'Pronto para Pauta'), [projects]);
    const projetosExpedienteOriginal = useMemo(() => buildHierarchy(projetosPauta.filter(p => p.projectPhase === 'Expediente')), [projetosPauta]);
    const projetosOrdemDoDiaOriginal = useMemo(() => buildHierarchy(projetosPauta.filter(p => p.projectPhase === 'Ordem do Dia')), [projetosPauta]);
    
    const [expedienteOrdenado, setExpedienteOrdenado] = useState<ProjectWithChildren[]>([]);
    const [ordemDoDiaOrdenada, setOrdemDoDiaOrdenada] = useState<ProjectWithChildren[]>([]);
    
    useEffect(() => setExpedienteOrdenado(projetosExpedienteOriginal), [projetosExpedienteOriginal]);
    useEffect(() => setOrdemDoDiaOrdenada(projetosOrdemDoDiaOriginal), [projetosOrdemDoDiaOriginal]);
    
    // --- Drag and Drop State and Handlers ---
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
        setDraggedIndex(index);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnter = (index: number) => {
        if (draggedIndex === null || draggedIndex === index) return;
        setDragOverIndex(index);
    };

    const handleDragEnd = () => {
        if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
            const listUpdater = pautaTab === 'Expediente' ? setExpedienteOrdenado : setOrdemDoDiaOrdenada;
            listUpdater(currentList => {
                const listCopy = [...currentList];
                const [draggedItemContent] = listCopy.splice(draggedIndex, 1);
                listCopy.splice(dragOverIndex, 0, draggedItemContent);
                return listCopy;
            });
        }
        setDraggedIndex(null);
        setDragOverIndex(null);
    };

    // --- Pauta Persistence Logic ---
    const showFeedback = (message: string) => {
        setFeedback(message);
        setTimeout(() => setFeedback(''), 3000);
    };

    const PAUTA_STORAGE_KEY = 'sapv-pauta-ordem-presidente';

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

        const reorderList = (originalList: ProjectWithChildren[], savedIds: string[]): ProjectWithChildren[] => {
            const projectMap = new Map(originalList.map(p => [p.id, p]));
            const orderedList: ProjectWithChildren[] = [];
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
    // --- End of Pauta Logic ---

    const handleSetDefaultTime = () => {
        const timeInMinutes = Math.max(0.1, defaultSpeakerTime);
        const durationInSeconds = timeInMinutes * 60;
        setDefaultSpeakerDuration(durationInSeconds);
        showFeedback(`Tempo padrão do orador definido para ${timeInMinutes} minutos.`);
    };

    const handleEndVoting = () => {
        if (!user) return;
        calculateResult(user.name);
    };
    
    const handleSelectProject = (project: Project) => {
        if(session.status === 'active') {
            setCurrentProject(project);
        }
    };
    
    const presentCount = Object.values(session.presence).filter(p => p).length;
    const quorumMet = presentCount >= legislatureConfig.quorumToOpen;

    const PointOfOrderAlert: React.FC = () => {
        if (!session.pointOfOrderRequest?.active) return null;
        return (
            <div className="bg-orange-900 border border-orange-500 text-orange-300 p-4 rounded-lg mb-4 flex justify-between items-center animate-pulse">
                <div className="flex items-center">
                    <HelpCircle className="mr-3"/>
                    <p><span className="font-bold">{session.pointOfOrderRequest.from.name}</span> solicita uma Questão de Ordem.</p>
                </div>
                <Button onClick={() => resolvePointOfOrder()} variant="secondary" size="sm"><CheckCircle size={16} className="mr-1"/> Ciente</Button>
            </div>
        )
    }
    
    const VerificationRequestAlert: React.FC = () => {
        if (!session.verificationRequest?.active || !user) return null;
        return (
             <div className="bg-blue-900 border border-blue-500 text-blue-300 p-4 rounded-lg mb-4 flex justify-between items-center animate-pulse">
                <div className="flex items-center">
                    <AlertTriangle className="mr-3"/>
                    <p><span className="font-bold">{session.verificationRequest.from.name}</span> pede verificação de votação.</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => resolveVerification(true, user.name)} variant="success" size="sm"><CheckCircle size={16} className="mr-1"/> Deferir</Button>
                    <Button onClick={() => resolveVerification(false, user.name)} variant="danger" size="sm"><X size={16} className="mr-1"/> Indeferir</Button>
                </div>
            </div>
        )
    }

    const flattenProjects = (projects: ProjectWithChildren[]): Project[] => {
        let allProjects: Project[] = [];
        for (const project of projects) {
            allProjects.push(project);
            if (project.children && project.children.length > 0) {
                allProjects = allProjects.concat(flattenProjects(project.children));
            }
        }
        return allProjects;
    };

    const blockVoteItems = useMemo(() => 
        flattenProjects([...projetosExpedienteOriginal, ...projetosOrdemDoDiaOriginal])
        .filter(p => p.matterType === 'REQUERIMENTO' || p.matterType === 'Votação em Bloco'), 
    [projetosExpedienteOriginal, projetosOrdemDoDiaOriginal]);
    
    const handleToggleBlockItem = (projectId: string) => {
        setSelectedBlockItems(prev => {
            const newSet = new Set(prev);
            if (newSet.has(projectId)) {
                newSet.delete(projectId);
            } else {
                newSet.add(projectId);
            }
            return newSet;
        });
    };

    const handleVoteEmBloco = () => {
        const projectsToVote = projects.filter(p => selectedBlockItems.has(p.id));
        if (projectsToVote.length === 0 || !user) return;

        const description = projectsToVote.map(p => p.title).join('; ');
        const blockVoteProject: Project = {
            id: `block-vote-${Date.now()}`,
            title: `VOTAÇÃO EM BLOCO (${projectsToVote.length} ITENS)`,
            description: description,
            author: user,
            votingStatus: 'pending',
            workflowStatus: 'Pronto para Pauta',
            votingRules: {
                type: VotingType.SIMBOLICA,
                majority: projectsToVote[0]?.votingRules.majority || MajorityType.SIMPLES,
            },
            blockVotedProjectIds: Array.from(selectedBlockItems),
        };

        setCurrentProject(blockVoteProject);
        setSelectedBlockItems(new Set());
    };
        
    const presentMembers = useMemo(() => councilMembers.filter(m => session.presence[m.uid]), [councilMembers, session.presence]);
    const areAllMicsOff = useMemo(() => presentMembers.every(m => !session.microphoneStatus[m.uid]), [presentMembers, session.microphoneStatus]);


    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Painel do Presidente</h1>
                    <p className="text-sapv-gray">Bem-vindo, {user?.name}</p>
                </div>
                <Button onClick={logout} variant="danger">
                    <LogOut className="inline-block mr-2" size={16} /> Sair
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Comandos da Sessão">
                        <div className="flex gap-4">
                            {session.status === 'inactive' ? (
                                <Button onClick={startSession} disabled={!quorumMet} size="lg" className="flex-1 py-4 text-xl">
                                    <Play size={24} className="mr-3" /> Iniciar Sessão Local ({presentCount}/{legislatureConfig.totalMembers})
                                </Button>
                            ) : (
                                <>
                                    <Button onClick={() => setPhase('Expediente')} variant={session.phase === 'Expediente' ? 'primary' : 'secondary'}>Iniciar Expediente</Button>
                                    <Button onClick={() => setPhase('Ordem do Dia')} variant={session.phase === 'Ordem do Dia' ? 'primary' : 'secondary'}>Iniciar Ordem do Dia</Button>
                                    <Button onClick={endSession} variant="danger" size="lg" className="flex-1 py-4 text-xl">
                                        <XCircle size={24} className="mr-3" /> Encerrar e Sincronizar
                                    </Button>
                                </>
                            )}
                        </div>
                        {!quorumMet && session.status === 'inactive' && <p className="text-xs text-yellow-400 text-center mt-2">Quórum mínimo de {legislatureConfig.quorumToOpen} para abertura não atingido.</p>}
                    </Card>
                    
                    <PointOfOrderAlert />
                    <VerificationRequestAlert />

                    <Card title="Controle de Votação">
                        <div className="text-center mb-4 p-3 bg-sapv-blue-dark rounded-md">
                            <h3 className="text-2xl font-semibold">{session.currentProject?.title || "Nenhum projeto em pauta"}</h3>
                            <p className="text-md text-sapv-gray">{session.currentProject?.votingRules.majority}</p>
                             {session.currentProject?.pareceres && session.currentProject.pareceres.length > 0 && (
                                <div className="mt-3 text-left text-xs space-y-1 border-t border-sapv-gray-dark pt-2">
                                    <h4 className="font-bold text-sapv-gray-light">Pareceres das Comissões:</h4>
                                    {session.currentProject.pareceres.map(p => (
                                        <div key={p.id} className={`flex justify-between items-center p-1 rounded ${p.status === 'Favorável' ? 'bg-green-900/50' : 'bg-red-900/50'}`}>
                                            <span><span className="font-bold">{p.commissionName}:</span> {p.content}</span>
                                            <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${p.status === 'Favorável' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{p.status}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        {session.isSymbolicVoting ? (
                             <div className="grid grid-cols-1 gap-4">
                                <p className="text-center text-yellow-300 animate-pulse">AGUARDANDO VOTAÇÃO SIMBÓLICA</p>
                                <Button onClick={() => user && resolveSymbolicVote('approved', user.name)} variant="success" size="lg" className="py-8 text-2xl">REGISTRAR APROVADO</Button>
                                <Button onClick={() => user && resolveSymbolicVote('rejected', user.name)} variant="danger" size="lg" className="py-8 text-2xl">REGISTRAR REJEITADO</Button>
                             </div>
                        ) : (
                             <div className="grid grid-cols-2 gap-4">
                                {(session.currentProject?.votingRules.type === VotingType.SIMBOLICA || session.currentProject?.id.startsWith('block-vote')) ? (
                                    <Button onClick={startSymbolicVoting} variant="primary" disabled={!session.currentProject || session.votingOpen} size="lg" className="py-8 text-2xl">
                                        INICIAR VOTAÇÃO SIMBÓLICA
                                    </Button>
                                ) : (
                                    <Button onClick={() => setVotingStatus(true)} variant="success" disabled={!session.currentProject || session.votingOpen || presentCount < legislatureConfig.votingQuorum} size="lg" className="py-8 text-2xl">
                                        ABRIR VOTAÇÃO NOMINAL
                                    </Button>
                                )}
                                <Button onClick={handleEndVoting} variant="danger" disabled={!session.votingOpen} size="lg" className="py-8 text-2xl">
                                    ENCERRAR VOTAÇÃO
                                </Button>
                                <Button onClick={() => restartVoting()} variant="secondary" disabled={!session.currentProject || session.votingOpen}><RotateCcw size={16} className="mr-2"/> Reiniciar</Button>
                                <Button onClick={() => annulVoting()} variant="secondary" disabled={!session.currentProject}><Ban size={16} className="mr-2"/> Anular</Button>
                            </div>
                        )}
                        {presentCount < legislatureConfig.votingQuorum && session.currentProject && !session.currentProject.id.startsWith('block-vote') && <p className="text-xs text-yellow-400 text-center mt-2">Quórum mínimo de {legislatureConfig.votingQuorum} para votação não atingido.</p>}
                    </Card>
                    
                     <Card title="Controle da Tribuna">
                        <div className="flex items-center gap-3 p-3 bg-sapv-blue-dark rounded-md mb-4 border-b border-sapv-gray-dark">
                            <label htmlFor="speaker-time" className="text-sm font-semibold whitespace-nowrap">Tempo Padrão (min):</label>
                            <input
                                id="speaker-time"
                                type="number"
                                value={defaultSpeakerTime}
                                onChange={(e) => setDefaultSpeakerTime(Number(e.target.value))}
                                min="1"
                                step="1"
                                className="w-20 px-2 py-1 bg-sapv-blue-light border border-sapv-gray-dark rounded-md"
                                aria-label="Tempo padrão do orador em minutos"
                            />
                            <Button onClick={handleSetDefaultTime} size="sm" variant="secondary">Definir</Button>
                        </div>
                        {session.interruptionRequest?.active && (
                            <div className="bg-yellow-900 border border-yellow-500 text-yellow-300 p-4 rounded-lg mb-4 flex justify-between items-center animate-pulse">
                                <div className="flex items-center">
                                    <AlertTriangle className="mr-3"/>
                                    <p><span className="font-bold">{session.interruptionRequest.from.name}</span> pede um aparte.</p>
                                </div>
                                <div className="flex gap-2">
                                    <Button onClick={() => resolveInterruption(true)} variant="success" size="sm"><CheckCircle size={16} className="mr-1"/> Conceder</Button>
                                    <Button onClick={() => resolveInterruption(false)} variant="danger" size="sm"><X size={16} className="mr-1"/> Negar</Button>
                                </div>
                            </div>
                        )}
                        {session.currentSpeaker ? (
                            <div className="bg-sapv-blue-dark p-4 rounded text-center">
                                <p className="text-sm text-sapv-gray">Orador atual</p>
                                <p className="text-3xl font-bold">{session.currentSpeaker.name}</p>
                                 {session.speakerTimerEndTime && (
                                    <div className={`font-mono text-6xl font-bold my-4 ${remainingSpeakerTime !== null && remainingSpeakerTime < 30 ? 'text-red-500 animate-pulse' : 'text-sapv-highlight'}`}>
                                        {formatTime(remainingSpeakerTime)}
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2 mt-4 justify-center">
                                    <Button onClick={() => pauseSpeakerTimer()} variant='secondary' disabled={!session.speakerTimerEndTime}>
                                        {session.speakerTimerPaused ? <Play size={16} className="mr-1"/> : <Pause size={16} className="mr-1"/>} 
                                        {session.speakerTimerPaused ? 'Retomar' : 'Pausar'}
                                    </Button>
                                    <Button onClick={() => addSpeakerTime(30)} variant='secondary' disabled={!session.speakerTimerEndTime}><Plus size={16} /> +30s</Button>
                                    <Button onClick={advanceSpeakerQueue} variant='danger'><XCircle size={16} /> Encerrar Palavra</Button>
                                </div>
                            </div>
                        ) : (
                             <Button onClick={advanceSpeakerQueue} disabled={session.speakerQueue.length === 0} size="lg" className="w-full">
                                <Mic size={20} className="mr-2"/> Conceder a Palavra ao Próximo
                            </Button>
                        )}
                    </Card>
                </div>
                
                <div className="lg:col-span-1 space-y-6">
                     <Card title="Pauta da Sessão (Arraste para Reordenar)">
                        <div className="flex border-b border-sapv-gray-dark mb-2">
                            <button onClick={() => setPautaTab('Expediente')} className={`px-4 py-2 text-sm font-semibold ${pautaTab === 'Expediente' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>Expediente</button>
                            <button onClick={() => setPautaTab('Ordem do Dia')} className={`px-4 py-2 text-sm font-semibold ${pautaTab === 'Ordem do Dia' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>Ordem do Dia</button>
                        </div>
                        <div className="flex justify-end items-center gap-2 mb-4 border-b border-sapv-gray-dark pb-2">
                            {feedback && <span className="text-xs text-green-400 mr-auto transition-opacity duration-300">{feedback}</span>}
                            <Button size="sm" variant="secondary" onClick={handleSaveOrder}><Save size={14} className="mr-1"/> Salvar Ordem</Button>
                            <Button size="sm" variant="secondary" onClick={handleLoadOrder}><Upload size={14} className="mr-1"/> Carregar Ordem</Button>
                        </div>
                        <div 
                            className="space-y-1 max-h-60 overflow-y-auto pr-2"
                            onDragLeave={() => setDragOverIndex(null)}
                        >
                           {(pautaTab === 'Expediente' ? expedienteOrdenado : ordemDoDiaOrdenada).map((p, index) => (
                                <React.Fragment key={p.id}>
                                    {dragOverIndex === index && draggedIndex !== index && <div className="h-1 bg-sapv-highlight rounded-full my-1" />}
                                    <div 
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, index)}
                                        onDragEnter={() => handleDragEnter(index)}
                                        onDragEnd={handleDragEnd}
                                        onDragOver={(e) => e.preventDefault()}
                                        className={`relative p-3 rounded-md flex items-start gap-2 transition-opacity duration-300
                                            ${draggedIndex === index ? 'opacity-30' : 'opacity-100'} 
                                            ${session.currentProject?.id === p.id ? 'bg-blue-900 ring-2 ring-blue-400' : 'bg-sapv-blue-dark'}`
                                        }
                                    >
                                        <GripVertical className="mt-1 text-sapv-gray cursor-grab flex-shrink-0" size={18} />
                                        <div className="flex-grow">
                                            <p className="font-bold">{p.title}</p>
                                            <p className="text-sm text-sapv-gray">{p.author.name}</p>
                                            {p.children && p.children.length > 0 && (
                                                <div className="pl-4 mt-2 border-l-2 border-sapv-gray-dark space-y-2">
                                                    {p.children.map(child => (
                                                        <div key={child.id} className={`p-2 rounded-md ${session.currentProject?.id === child.id ? 'bg-blue-800' : 'bg-sapv-gray-dark/50'}`}>
                                                            <p className="font-semibold text-sm">{child.title}</p>
                                                            <p className="text-xs text-sapv-gray">{child.author.name}</p>
                                                            <Button onClick={() => handleSelectProject(child)} className="w-full mt-1" size="sm" disabled={session.currentProject?.id === child.id || session.status !== 'active'}>
                                                                {session.currentProject?.id === child.id ? 'EM PAUTA' : 'Pautar Votação'}
                                                            </Button>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            <Button onClick={() => handleSelectProject(p)} className="w-full mt-2" size="sm" disabled={session.currentProject?.id === p.id || session.status !== 'active'}>
                                                {session.currentProject?.id === p.id ? 'EM PAUTA' : 'Pautar Votação'}
                                            </Button>
                                        </div>
                                    </div>
                               </React.Fragment>
                           ))}
                        </div>
                    </Card>
                     <Card title={`Votação em Bloco (${selectedBlockItems.size}/${blockVoteItems.length})`}>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 mb-4">
                            {blockVoteItems.map(p => (
                                <label key={p.id} className={`flex items-center p-2 rounded-md cursor-pointer ${selectedBlockItems.has(p.id) ? 'bg-blue-800' : 'bg-sapv-blue-dark'}`}>
                                    <input type="checkbox" checked={selectedBlockItems.has(p.id)} onChange={() => handleToggleBlockItem(p.id)} className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-600 ring-offset-gray-800 focus:ring-2" />
                                    <span className="ml-3 text-sm">{p.title}</span>
                                </label>
                            ))}
                        </div>
                        <Button onClick={handleVoteEmBloco} disabled={selectedBlockItems.size === 0} className="w-full"><Layers className="mr-2" size={16}/> Votar {selectedBlockItems.size} Itens em Bloco</Button>
                    </Card>
                    <Card title={`Inscritos para a Palavra (${session.speakerQueue.length})`}>
                        <ul className="space-y-2 max-h-48 overflow-y-auto">
                            {session.speakerQueue.map((v, i) => <li key={v.uid} className="bg-sapv-blue-dark p-3 rounded font-semibold">{i + 1}º - {v.name}</li>)}
                            {session.speakerQueue.length === 0 && <li className="text-sapv-gray text-center py-4">Ninguém inscrito.</li>}
                        </ul>
                    </Card>
                    <Card title="Controle de Microfones">
                        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                            {presentMembers.map(member => {
                                const isMicOn = session.microphoneStatus[member.uid];
                                const isSpeaking = session.currentSpeaker?.uid === member.uid;
                                const rowStyle = isSpeaking
                                    ? 'bg-blue-800 ring-2 ring-blue-500'
                                    : isMicOn
                                    ? 'bg-green-900/50'
                                    : 'bg-sapv-blue-dark';

                                return (
                                    <div key={member.uid} className={`flex items-center justify-between p-2 rounded transition-colors ${rowStyle}`}>
                                        <span className={`font-semibold ${isSpeaking ? 'text-sapv-highlight' : ''}`}>{member.name}</span>
                                        <Button 
                                            size="sm" 
                                            onClick={() => toggleMicrophone(member.uid)}
                                            variant={isMicOn ? 'success' : 'danger'}
                                            className="!p-2"
                                            aria-label={isMicOn ? `Desligar microfone de ${member.name}` : `Ligar microfone de ${member.name}`}
                                        >
                                            {isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
                                        </Button>
                                    </div>
                                )
                            })}
                            {presentMembers.length === 0 && <p className="text-sapv-gray text-center py-4">Nenhum vereador presente.</p>}
                        </div>
                        {presentMembers.length > 0 && (
                            <div className="border-t border-sapv-gray-dark mt-4 pt-4">
                                <Button
                                    onClick={muteAllMicrophones}
                                    variant="secondary"
                                    size="sm"
                                    className="w-full"
                                    disabled={areAllMicsOff}
                                >
                                    <MicOff size={16} className="mr-2"/> Silenciar Todos os Microfones
                                </Button>
                            </div>
                        )}
                    </Card>
                     <Card title="Chat Operacional da Mesa" className="flex flex-col h-96">
                        <OperationalChat />
                    </Card>
                </div>

            </div>
        </div>
    );
};

export default PresidenteDashboard;