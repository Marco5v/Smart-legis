
import React, { useState } from 'react';
import { LogOut, FileText, Users, Flag, Settings, BookMarked, Briefcase, CalendarCheck } from 'lucide-react';
import Button from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

import { ProjectsTab } from '../components/secretaria/ProjectsTab';
import { CouncilMembersTab } from '../components/secretaria/CouncilMembersTab';
import { PartiesTab } from '../components/secretaria/PartiesTab';
import { LegislatureTab } from '../components/secretaria/LegislatureTab';
import { AtasTab } from '../components/secretaria/AtasTab';
import { CommissionsTab } from '../components/secretaria/CommissionsTab';
import { OperationalChat } from '../components/common/OperationalChat';
import Card from '../components/common/Card';
import { CurrentSessionTab } from '../components/secretaria/CurrentSessionTab';


const SecretariaDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('projects');
    
    const renderContent = () => {
        switch(activeTab) {
            case 'currentSession':
                return <CurrentSessionTab />;
            case 'projects':
                return <ProjectsTab />;
            case 'vereadores':
                return <CouncilMembersTab />;
            case 'partidos':
                return <PartiesTab />;
            case 'comissoes':
                return <CommissionsTab />;
            case 'legislatura':
                return <LegislatureTab />;
            case 'atas':
                return <AtasTab />;
            default: return null;
        }
    }
    
    const TabButton: React.FC<{tabId: string, label: string, icon: React.ReactNode}> = ({tabId, label, icon}) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`flex items-center space-x-2 px-4 py-3 border-b-2 font-semibold transition-all duration-300 ${activeTab === tabId ? 'border-sapv-highlight text-sapv-highlight' : 'border-transparent text-sapv-gray hover:text-sapv-gray-light'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Painel da Secretaria</h1>
                    <p className="text-sapv-gray">Bem-vindo(a), {user?.name}</p>
                </div>
                <Button onClick={logout} variant="danger">
                    <LogOut className="inline-block mr-2" size={16} /> Sair
                </Button>
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    <div className="flex border-b border-sapv-gray-dark mb-8 overflow-x-auto">
                        <TabButton tabId="projects" label="Tramitação de Projetos" icon={<FileText size={18} />} />
                        <TabButton tabId="currentSession" label="Sessão Atual" icon={<CalendarCheck size={18} />} />
                        <TabButton tabId="atas" label="Atas da Sessão" icon={<BookMarked size={18} />} />
                        <TabButton tabId="comissoes" label="Comissões" icon={<Briefcase size={18} />} />
                        <TabButton tabId="vereadores" label="Cadastros" icon={<Users size={18} />} />
                        <TabButton tabId="partidos" label="Partidos" icon={<Flag size={18} />} />
                        <TabButton tabId="legislatura" label="Legislatura" icon={<Settings size={18} />} />
                    </div>
                    <main>
                        {renderContent()}
                    </main>
                </div>
                <div className="lg:col-span-1">
                     <Card title="Chat Operacional da Mesa" className="flex flex-col h-[calc(100vh-150px)]">
                        <OperationalChat />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default SecretariaDashboard;
