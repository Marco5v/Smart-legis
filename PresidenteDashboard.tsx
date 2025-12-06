import React, { useMemo, useState, useEffect } from 'react';
import { LogOut, Play, Vote, Mic, XCircle, Pause, Plus, RotateCcw, Ban, AlertTriangle, CheckCircle, X, HelpCircle, Layers, GripVertical, Save, Upload, MicOff } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useSession } from '../context/SessionContext';
import { useAuth } from '../context/AuthContext';
import { Project, PanelView, VotingType, MajorityType, UserProfile, ProjectWorkflowStatus, SessionPhase, ProjectPhase } from '../types';
import { OperationalChat } from '../components/common/OperationalChat';
import Tabs from '../components/common/Tabs';
import { motion, AnimatePresence } from 'framer-motion';

type ProjectWithChildren = Project & { children: ProjectWithChildren[] };

const PresidenteDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { 
        session, projects, setVotingStatus, advanceSpeakerQueue, legislatureConfig,
        startSession, endSession, calculateResult, restartVoting,
        annulVoting, pauseSpeakerTimer, addSpeakerTime, resolveInterruption, setCurrentProject,
        resolvePointOfOrder, setPhase, toggleMicrophone, muteAllMicrophones,
        startSymbolicVoting, resolveSymbolicVote, resolveVerification,
        councilMembers, setDefaultSpeakerDuration, setPanelMessage, setPanelView
    } = useSession();
    
    // ... (O restante do estado e lógica do componente permanecem os mesmos) ...
    const [pautaTab, setPautaTab] = useState<'Expediente' | 'Ordem do Dia'>('Expediente');
    const [feedback, setFeedback] = useState('');
    const [remainingSpeakerTime, setRemainingSpeakerTime] = useState<number | null>(null);
    const [defaultSpeakerTime, setDefaultSpeakerTime] = useState(session.defaultSpeakerDuration / 60);
    
    // ... (useEffects e outras funções permanecem as mesmas) ...

    const PointOfOrderAlert: React.FC = () => {
        if (!session.pointOfOrderRequest?.active) return null;
        return (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-orange-900 border border-orange-500 text-orange-300 p-4 rounded-lg mb-4 flex justify-between items-center">
                <div className="flex items-center"><HelpCircle className="mr-3 animate-pulse"/><p><span className="font-bold">{session.pointOfOrderRequest.from.name}</span> solicita uma Questão de Ordem.</p></div>
                <Button onClick={() => resolvePointOfOrder()} variant="secondary" size="sm"><CheckCircle size={16} className="mr-1"/> Ciente</Button>
            </motion.div>
        )
    }
    
    const VerificationRequestAlert: React.FC = () => {
        if (!session.verificationRequest?.active || !user) return null;
        return (
             <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-blue-900 border border-blue-500 text-blue-300 p-4 rounded-lg mb-4 flex justify-between items-center">
                <div className="flex items-center"><AlertTriangle className="mr-3 animate-pulse"/><p><span className="font-bold">{session.verificationRequest.from.name}</span> pede verificação de votação.</p></div>
                <div className="flex gap-2">
                    <Button onClick={() => resolveVerification(true, user.name)} variant="success" size="sm"><CheckCircle size={16} className="mr-1"/> Deferir</Button>
                    <Button onClick={() => resolveVerification(false, user.name)} variant="danger" size="sm"><X size={16} className="mr-1"/> Indeferir</Button>
                </div>
            </motion.div>
        )
    }
    
    const presentCount = Object.values(session.presence).filter(p => p).length;
    const quorumMet = presentCount >= legislatureConfig.quorumToOpen;

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
            <header className="flex justify-between items-center mb-8">
                <div><h1 className="text-3xl font-bold">Painel do Presidente</h1><p className="text-sapv-gray">Bem-vindo, {user?.name}</p></div>
                <Button onClick={logout} variant="danger"><LogOut className="inline-block mr-2" size={16} /> Sair</Button>
            </header>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card title="Comandos da Sessão">
                        {/* ... (lógica do botão de iniciar/encerrar sessão) ... */}
                         <div className="flex gap-4 items-center">
                            <p className="text-lg">Sessão: <span className={`font-bold uppercase ${session.status === 'active' ? 'text-green-400 animate-pulse' : 'text-red-400'}`}>{session.status === 'active' ? 'ATIVA' : 'INATIVA'}</span></p>
                            {session.status === 'inactive' ? (
                                <Button onClick={() => user && startSession(user.name)} disabled={!quorumMet} size="lg" className="flex-1 py-4 text-xl"><Play size={24} className="mr-3" /> Iniciar Sessão ({presentCount}/{legislatureConfig.totalMembers})</Button>
                            ) : (
                                <>
                                    <Button onClick={() => setPhase(SessionPhase.EXPEDIENTE)} variant={session.phase === SessionPhase.EXPEDIENTE ? 'primary' : 'secondary'}>Expediente</Button>
                                    <Button onClick={() => setPhase(SessionPhase.ORDEM_DO_DIA)} variant={session.phase === SessionPhase.ORDEM_DO_DIA ? 'primary' : 'secondary'}>Ordem do Dia</Button>
                                    <Button onClick={() => user && endSession(user.name)} variant="danger"><XCircle size={16} className="mr-2" /> Encerrar</Button>
                                </>
                            )}
                        </div>
                    </Card>
                    <AnimatePresence><PointOfOrderAlert /></AnimatePresence>
                    <AnimatePresence><VerificationRequestAlert /></AnimatePresence>
                    {/* ... (Restante do JSX do dashboard do presidente) ... */}
                </div>
                {/* ... (Restante das colunas) ... */}
            </div>
        </div>
    );
};

export default PresidenteDashboard;
