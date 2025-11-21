

import React, { useMemo, useCallback, useState } from 'react';
import { LogOut, Mic, Check, X, Minus, AlertOctagon, HelpCircle, FileText, Vote, Briefcase, BookOpen, Search } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import { VoteOption } from '../types';

const TabButton: React.FC<{label: string, icon: React.ReactNode, isActive: boolean, onClick: () => void}> = ({ label, icon, isActive, onClick }) => (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center p-4 text-sm font-semibold border-b-4 transition-colors ${isActive ? 'border-sapv-highlight text-sapv-highlight' : 'border-transparent text-sapv-gray hover:text-sapv-gray-light'}`}>
        {icon}
        <span className="mt-1">{label}</span>
    </button>
);

const PautaTab: React.FC = () => {
    const { projects } = useSession();
    const [pautaTab, setPautaTab] = useState<'Expediente' | 'Ordem do Dia'>('Expediente');
    
    const projetosPauta = projects.filter(p => p.workflowStatus === 'Pronto para Pauta');
    const projetosExpediente = projetosPauta.filter(p => p.projectPhase === 'Expediente');
    const projetosOrdemDoDia = projetosPauta.filter(p => p.projectPhase === 'Ordem do Dia');

    return (
        <div>
            <div className="flex border-b border-sapv-gray-dark mb-4">
                <button onClick={() => setPautaTab('Expediente')} className={`px-4 py-2 text-lg font-semibold ${pautaTab === 'Expediente' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>Expediente</button>
                <button onClick={() => setPautaTab('Ordem do Dia')} className={`px-4 py-2 text-lg font-semibold ${pautaTab === 'Ordem do Dia' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>Ordem do Dia</button>
            </div>
            <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                {(pautaTab === 'Expediente' ? projetosExpediente : projetosOrdemDoDia).map(p => (
                    <div key={p.id} className="bg-sapv-blue-dark p-4 rounded-lg">
                        <h4 className="font-bold text-sapv-gray-light">{p.title}</h4>
                        <p className="text-sm text-sapv-gray mt-1">{p.description}</p>
                        <p className="text-xs text-sapv-gray-dark mt-2">Autor: {p.author.name}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

const BibliotecaTab: React.FC = () => {
    const documents = useMemo(() => [
        { 
            id: 'lei-organica', 
            title: 'Lei Orgânica do Município', 
            description: 'A lei fundamental do município, que rege a organização dos poderes e os direitos e deveres dos cidadãos.',
            keywords: 'constituição municipal lei maior'
        },
        { 
            id: 'regimento-interno', 
            title: 'Regimento Interno da Câmara', 
            description: 'Regulamenta o funcionamento interno da Câmara Municipal, as sessões, as comissões e os procedimentos legislativos.',
            keywords: 'normas regras vereadores plenário'
        },
    ], []);

    const [searchQuery, setSearchQuery] = useState('');
    
    const filteredDocuments = useMemo(() => {
        if (!searchQuery.trim()) {
            return documents;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return documents.filter(doc => 
            doc.title.toLowerCase().includes(lowercasedQuery) ||
            doc.description.toLowerCase().includes(lowercasedQuery) ||
            doc.keywords.toLowerCase().includes(lowercasedQuery)
        );
    }, [searchQuery, documents]);

    return (
        <div className="p-4">
            <h3 className="text-2xl font-bold mb-4 text-center">Biblioteca de Documentos</h3>
            <p className="text-sapv-gray mb-6 text-center">Área de consulta rápida para Lei Orgânica do Município e Regimento Interno da Câmara.</p>
            
            <div className="mb-8 max-w-lg mx-auto relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sapv-gray" size={20} />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar em documentos..."
                    className="w-full pl-10 pr-4 py-2 text-sapv-gray-light bg-sapv-blue-dark border border-sapv-gray-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    aria-label="Buscar documentos"
                />
            </div>
            
            <div className="space-y-4 max-w-lg mx-auto">
                {filteredDocuments.length > 0 ? (
                    filteredDocuments.map(doc => (
                         <div key={doc.id} className="bg-sapv-blue-dark p-4 rounded-lg border border-sapv-gray-dark">
                             <h4 className="font-bold text-sapv-gray-light">{doc.title}</h4>
                             <p className="text-sm text-sapv-gray mt-1">{doc.description}</p>
                             <Button size="sm" className="mt-3" variant="secondary">Consultar Documento</Button>
                         </div>
                    ))
                ) : (
                    <p className="text-sapv-gray text-center py-8">Nenhum documento encontrado para sua busca.</p>
                )}
            </div>
        </div>
    );
}

const VereadorInterface: React.FC = () => {
    const { user, logout } = useAuth();
    const { session, castVote, requestToSpeak, requestInterruption, requestPointOfOrder, requestVerification } = useSession();
    const [activeTab, setActiveTab] = useState<'pauta' | 'votacao' | 'inscricao' | 'comissoes' | 'biblioteca'>('votacao');
    
    if (!user) return null;

    const myVote = useMemo(() => session.votes[user.uid], [session.votes, user.uid]);
    const isQueued = useMemo(() => session.speakerQueue.some(v => v.uid === user.uid), [session.speakerQueue, user.uid]);
    const isSpeaking = useMemo(() => session.currentSpeaker?.uid === user.uid, [session.currentSpeaker, user.uid]);
    const speakerActive = !!session.currentSpeaker;
    const interruptionPending = !!session.interruptionRequest?.active;
    const pointOfOrderPending = !!session.pointOfOrderRequest?.active;
    const verificationRequested = !!session.verificationRequest?.active;

    const handleVote = useCallback((vote: VoteOption) => {
        if (!session.votingOpen || myVote) return;
        // FIX: Pass voterName for logging purposes.
        castVote(user.uid, vote, user.name);
    }, [session.votingOpen, myVote, castVote, user.uid, user.name]);

    const handleRequestToSpeak = useCallback(() => {
        if (isQueued) return;
        requestToSpeak(user);
    }, [isQueued, requestToSpeak, user]);

    const handleRequestInterruption = useCallback(() => {
        if (isSpeaking || !speakerActive || interruptionPending) return;
        requestInterruption(user);
    }, [isSpeaking, speakerActive, interruptionPending, requestInterruption, user]);
    
    const handleRequestPointOfOrder = useCallback(() => {
        if (pointOfOrderPending) return;
        requestPointOfOrder(user);
    }, [pointOfOrderPending, requestPointOfOrder, user]);
    
    const handleRequestVerification = useCallback(() => {
        if (!session.isSymbolicVoting || verificationRequested) return;
        requestVerification(user);
    }, [session.isSymbolicVoting, verificationRequested, requestVerification, user]);

    const renderTabContent = () => {
        switch(activeTab) {
            case 'pauta':
                return <PautaTab />;
            case 'votacao':
                return (
                    <div className="text-center">
                        <h2 className="text-lg text-sapv-gray mb-2">Em discussão e votação</h2>
                        <h3 className="text-3xl font-bold text-sapv-gray-light mb-4">
                            {session.currentProject?.title || "Aguardando início da pauta"}
                        </h3>
                        <p className="text-sapv-gray mb-8">
                            {session.currentProject?.description}
                        </p>

                        <div className="border-t border-sapv-gray-dark pt-8">
                           {session.isSymbolicVoting ? (
                                <div>
                                    <h4 className="text-xl font-bold mb-4 text-yellow-300 animate-pulse">VOTAÇÃO SIMBÓLICA EM CURSO</h4>
                                    <Button onClick={handleRequestVerification} size="lg" disabled={verificationRequested} className="w-full max-w-sm !py-6 !text-xl bg-blue-600 hover:bg-blue-700">
                                        <Vote className="inline-block mr-2" size={24} />
                                        {verificationRequested ? 'VERIFICAÇÃO SOLICITADA' : 'PEDIR VERIFICAÇÃO DE VOTAÇÃO'}
                                    </Button>
                                </div>
                           ) : (
                                <>
                                    <h4 className="text-xl font-bold mb-4">
                                        {session.votingOpen ? "VOTAÇÃO NOMINAL ABERTA" : "VOTAÇÃO ENCERRADA"}
                                    </h4>
                                    <div className="grid grid-cols-3 gap-4">
                                        <Button onClick={() => handleVote(VoteOption.SIM)} variant="success" disabled={!session.votingOpen || !!myVote} className={`py-8 text-3xl font-extrabold ${myVote === VoteOption.SIM ? 'ring-4 ring-white' : ''}`}>
                                            <Check size={40} className="inline-block mb-2" /> <br/> SIM
                                        </Button>
                                        <Button onClick={() => handleVote(VoteOption.NAO)} variant="danger" disabled={!session.votingOpen || !!myVote} className={`py-8 text-3xl font-extrabold ${myVote === VoteOption.NAO ? 'ring-4 ring-white' : ''}`}>
                                            <X size={40} className="inline-block mb-2" /> <br/> NÃO
                                        </Button>
                                        <Button onClick={() => handleVote(VoteOption.ABS)} variant="secondary" disabled={!session.votingOpen || !!myVote} className={`py-8 text-3xl font-extrabold bg-yellow-600 hover:bg-yellow-700 ${myVote === VoteOption.ABS ? 'ring-4 ring-white' : ''}`}>
                                            <Minus size={40} className="inline-block mb-2" /> <br/> ABSTER
                                        </Button>
                                    </div>
                                    {myVote && !session.isSymbolicVoting && <p className="mt-4 text-sapv-highlight">Seu voto ({myVote}) foi registrado.</p>}
                                </>
                           )}
                        </div>
                    </div>
                );
            case 'inscricao':
                 return (
                     <div className="flex flex-col items-center justify-center pt-10 space-y-6">
                         <Button onClick={handleRequestToSpeak} size="lg" disabled={isQueued || isSpeaking} className="w-full max-w-sm !py-6 !text-xl">
                            <Mic className="inline-block mr-2" size={24} /> 
                            {isQueued ? 'Inscrito para falar' : 'Pedir a Palavra'}
                        </Button>
                        <Button onClick={handleRequestInterruption} size="lg" disabled={!speakerActive || isSpeaking || interruptionPending} variant="secondary" className="w-full max-w-sm !py-6 !text-xl">
                            <AlertOctagon className="inline-block mr-2" size={24} />
                            {interruptionPending ? 'Aparte Solicitado' : 'Pedir Aparte'}
                        </Button>
                        <Button onClick={handleRequestPointOfOrder} size="lg" disabled={pointOfOrderPending} variant="secondary" className="bg-orange-600 hover:bg-orange-700 w-full max-w-sm !py-6 !text-xl">
                            <HelpCircle className="inline-block mr-2" size={24} />
                            {pointOfOrderPending ? 'Solicitado' : 'Pela Ordem'}
                        </Button>
                    </div>
                 );
            case 'comissoes':
                return <div className="text-center p-8"><h3 className="text-2xl font-bold">Módulo de Comissões</h3><p className="text-sapv-gray mt-2">Acesso aos projetos e pareceres das comissões.</p></div>;
            case 'biblioteca':
                 return <BibliotecaTab />;
        }
    }

    return (
         <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8 flex flex-col">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-bold">Terminal do Vereador</h1>
                    <p className="text-sapv-gray">{user.name} ({user.party})</p>
                </div>
                <Button onClick={logout} variant="danger">
                    <LogOut className="inline-block mr-2" size={16} /> Sair
                </Button>
            </header>

            <main className="flex-grow flex flex-col">
                <Card className="w-full max-w-5xl mx-auto flex flex-col flex-grow">
                    <div className="flex">
                        <TabButton label="Pauta" icon={<FileText size={24}/>} isActive={activeTab === 'pauta'} onClick={() => setActiveTab('pauta')} />
                        <TabButton label="Votação" icon={<Vote size={24}/>} isActive={activeTab === 'votacao'} onClick={() => setActiveTab('votacao')} />
                        <TabButton label="Inscrição" icon={<Mic size={24}/>} isActive={activeTab === 'inscricao'} onClick={() => setActiveTab('inscricao')} />
                        <TabButton label="Comissões" icon={<Briefcase size={24}/>} isActive={activeTab === 'comissoes'} onClick={() => setActiveTab('comissoes')} />
                        <TabButton label="Biblioteca" icon={<BookOpen size={24}/>} isActive={activeTab === 'biblioteca'} onClick={() => setActiveTab('biblioteca')} />
                    </div>
                    <div className="flex-grow p-6">
                        {renderTabContent()}
                    </div>
                </Card>
            </main>
        </div>
    );
};


export default VereadorInterface;