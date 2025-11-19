import React, { useState, useCallback } from 'react';
import { useSession } from '../context/SessionContext';
import { MOCK_USERS } from '../services/mockData';
import { SessionConfig, SessionType, UserProfile } from '../types';
import { Play, Pause, Square, Power, Settings, Save, ListChecks, Users } from 'lucide-react';

// --- Componente para o Setup da Sessão ---
const SetupForm: React.FC<{ onStart: (config: SessionConfig) => void }> = ({ onStart }) => {
    const { session } = useSession();
    const [cityName, setCityName] = useState(session.cityName || 'Exemplo');
    const [sessionType, setSessionType] = useState<SessionType>(session.sessionType || 'Ordinária');
    const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set(session.legislatureMembers.length > 0 ? session.legislatureMembers : MOCK_USERS.map(u => u.uid)));

    const handleToggleMember = (uid: string) => {
        setSelectedMembers(prev => {
            const newSet = new Set(prev);
            if (newSet.has(uid)) {
                newSet.delete(uid);
            } else {
                newSet.add(uid);
            }
            return newSet;
        });
    };
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (cityName.trim() && selectedMembers.size > 0) {
            onStart({
                cityName,
                sessionType,
                legislatureMembers: Array.from(selectedMembers),
            });
        } else {
            alert('Por favor, preencha o nome da cidade e selecione ao menos um parlamentar.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
            <form onSubmit={handleSubmit}>
                <div className="text-center mb-8">
                    <Settings className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="text-2xl font-bold mt-4">Configuração da Sessão</h2>
                    <p className="text-gray-600">Defina os parâmetros antes de iniciar.</p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div>
                        <label htmlFor="cityName" className="block text-sm font-medium text-gray-700">Nome da Cidade/Câmara</label>
                        <input type="text" id="cityName" value={cityName} onChange={e => setCityName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"/>
                    </div>
                    <div>
                        <label htmlFor="sessionType" className="block text-sm font-medium text-gray-700">Tipo da Sessão</label>
                        <select id="sessionType" value={sessionType} onChange={e => setSessionType(e.target.value as SessionType)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-black focus:border-black sm:text-sm rounded-md">
                            <option>Ordinária</option>
                            <option>Extraordinária</option>
                            <option>Solene</option>
                        </select>
                    </div>
                </div>

                <div className="mb-8">
                     <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center"><ListChecks className="mr-2"/> Selecionar Vereadores para a Legislatura</h3>
                     <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-64 overflow-y-auto p-4 bg-white border border-gray-200 rounded-md">
                        {MOCK_USERS.map(user => (
                            <label key={user.uid} className="flex items-center space-x-3 cursor-pointer">
                                <input type="checkbox" checked={selectedMembers.has(user.uid)} onChange={() => handleToggleMember(user.uid)} className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"/>
                                <span className="text-sm font-medium text-gray-700">{user.name}</span>
                            </label>
                        ))}
                     </div>
                </div>

                <button type="submit" className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                    <Save size={20}/> Salvar e Iniciar Sessão
                </button>
            </form>
        </div>
    );
};


// --- Componente para a Operação da Sessão ---
const OperationPanel: React.FC = () => {
    const { session, councilMembers, togglePresence, pauseSession, resumeSession, endSession } = useSession();
    
    const activeMembers = councilMembers.filter(m => session.legislatureMembers.includes(m.uid));

    const PresenceToggle: React.FC<{ member: UserProfile }> = ({ member }) => {
        const isPresent = session.presence[member.uid] || false;
        return (
            <div 
                onClick={() => togglePresence(member.uid)}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer transition-colors ${isPresent ? 'bg-green-100 border-green-400' : 'bg-red-50 border-red-300'} border`}
            >
                <div className="flex items-center">
                    <img src={member.photoUrl} alt={member.name} className="w-10 h-10 rounded-full mr-3" />
                    <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.party}</p>
                    </div>
                </div>
                <div className={`w-14 h-8 rounded-full p-1 flex items-center transition-colors ${isPresent ? 'bg-green-500 justify-end' : 'bg-gray-300 justify-start'}`}>
                    <div className="w-6 h-6 bg-white rounded-full shadow-md"></div>
                </div>
            </div>
        );
    };

    return (
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <div className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Power className="mr-2"/>Controle da Sessão</h2>
                    <div className="space-y-3">
                        {session.status === 'active' && (
                            <button onClick={pauseSession} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-md text-black bg-yellow-400 hover:bg-yellow-500">
                                <Pause size={20} /> Pausar Sessão
                            </button>
                        )}
                         {session.status === 'paused' && (
                            <button onClick={resumeSession} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-md text-white bg-green-500 hover:bg-green-600">
                                <Play size={20} /> Retomar Sessão
                            </button>
                        )}
                        <button onClick={endSession} className="w-full flex items-center justify-center gap-2 px-4 py-3 font-semibold rounded-md text-white bg-red-600 hover:bg-red-700">
                            <Square size={20} /> Encerrar Sessão
                        </button>
                    </div>
                </div>
            </div>
            <div className="lg:col-span-2">
                 <div className="p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Users className="mr-2"/>Gestão de Presença</h2>
                    <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
                        {activeMembers.map(member => <PresenceToggle key={member.uid} member={member} />)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const ControllerDashboardPage: React.FC = () => {
    const { session, setupSession, startSession } = useSession();

    const handleStartSession = useCallback((config: SessionConfig) => {
        setupSession(config);
        startSession();
    }, [setupSession, startSession]);
    
    return (
        <div className="min-h-screen bg-white text-black p-4 md:p-8">
            <header className="text-center mb-8">
                <h1 className="text-3xl font-bold">Painel do Controlador</h1>
                <p className="text-gray-600">Mesa Diretora</p>
            </header>
            <main>
                {session.status === 'inactive' 
                    ? <SetupForm onStart={handleStartSession} /> 
                    : <OperationPanel />
                }
            </main>
        </div>
    );
};

export default ControllerDashboardPage;