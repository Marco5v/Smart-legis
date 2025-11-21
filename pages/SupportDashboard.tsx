import React, { useState, useEffect, useMemo, useRef } from 'react';
// FIX: Add missing icon imports
import { LogOut, ShieldAlert, Database, Wrench, UserCog, AlertTriangle, PowerOff, Activity, HardDrive, FileJson, History, Download, Upload, Filter, Battery, Wifi, WifiOff, X, Check, Search, Trash2, Play, Square, Vote, Edit, CheckCircle, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { DeviceStatus, SystemLog, VoteOption } from '../types';
import { MOCK_USERS } from '../services/mockData';

// --- MOCK DATA PARA PAINEL DE DIAGNÓSTICO ---
const generateMockDeviceStatus = (): DeviceStatus[] => {
    const councilUids = MOCK_USERS.filter(u => u.role === 'Vereador' || u.role === 'Presidente').map(u => ({uid: u.uid, name: u.name}));
    return councilUids.map((member, index) => {
        const statusRand = Math.random();
        let status: 'online' | 'offline' | 'unstable';
        if (statusRand > 0.8) status = 'online';
        else if (statusRand < 0.1) status = 'offline';
        else status = 'unstable';
        
        return {
            uid: member.uid,
            memberName: member.name,
            status: index === 3 ? 'offline' : status, // Forçar um offline
            batteryLevel: index === 5 ? 15 : Math.floor(Math.random() * 80) + 20, // Forçar uma bateria baixa
            lastPing: Date.now() - Math.floor(Math.random() * 600000), // nos últimos 10 min
            ipAddress: `192.168.1.${100 + index}`,
        };
    });
};

// --- SUB-COMPONENTES PARA AS ABAS ---

const HealthCheckTab: React.FC = () => {
    const [devices, setDevices] = useState<DeviceStatus[]>(generateMockDeviceStatus());

    useEffect(() => {
        const interval = setInterval(() => {
            setDevices(prevDevices => prevDevices.map(d => ({
                ...d,
                lastPing: Date.now() - Math.floor(Math.random() * 10000), // Ping a cada 10s
                batteryLevel: Math.max(0, d.batteryLevel - 0.05)
            })));
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const getStatusIndicator = (status: DeviceStatus['status']) => {
        switch (status) {
            case 'online': return <div className="w-3 h-3 rounded-full bg-green-500" title="Online"></div>;
            case 'offline': return <div className="w-3 h-3 rounded-full bg-red-500" title="Offline"></div>;
            case 'unstable': return <div className="w-3 h-3 rounded-full bg-yellow-500" title="Instável"></div>;
        }
    };
    
    const BatteryIndicator: React.FC<{ level: number }> = ({ level }) => {
        const color = level > 60 ? 'text-green-400' : level > 20 ? 'text-yellow-400' : 'text-red-400';
        return <span className={`${color} font-semibold`}>{level.toFixed(0)}%</span>;
    };
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card title="Uptime da Sessão" className="text-center"><p className="text-4xl font-bold">04:32:15</p></Card>
                <Card title="Uso de Memória" className="text-center"><p className="text-4xl font-bold">128.7 MB</p></Card>
                <Card title="Latência da Rede" className="text-center"><p className="text-4xl font-bold">32ms</p></Card>
            </div>
            <Card title="Status dos Dispositivos">
                <div className="overflow-x-auto max-h-[60vh]">
                     <table className="w-full text-left text-sm">
                        <thead className="border-b border-sapv-gray-dark text-xs text-sapv-gray uppercase sticky top-0 bg-sapv-blue-light">
                            <tr>
                                <th className="p-3">Status</th>
                                <th className="p-3">Vereador</th>
                                <th className="p-3">Bateria</th>
                                <th className="p-3">Último Ping</th>
                                <th className="p-3">IP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {devices.map(d => {
                                const isCritical = d.status === 'offline' || d.batteryLevel < 20;
                                return (
                                <tr key={d.uid} className={`border-b border-sapv-gray-dark hover:bg-sapv-blue-dark/50 ${isCritical ? 'bg-red-900/30' : ''}`}>
                                    <td className="p-3 flex items-center gap-2">{getStatusIndicator(d.status)} {d.status}</td>
                                    <td className="p-3 font-semibold">{d.memberName}</td>
                                    <td className="p-3"><BatteryIndicator level={d.batteryLevel} /></td>
                                    <td className="p-3">{new Date(d.lastPing).toLocaleTimeString()}</td>
                                    <td className="p-3 font-mono">{d.ipAddress}</td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

const AuditTab: React.FC = () => {
    const { systemLogs } = useSession();
    const [filterAction, setFilterAction] = useState('');
    const [filterUser, setFilterUser] = useState('');

    const logIcons: { [key: string]: React.ReactNode } = {
        'SESSAO_INICIADA': <Play size={16} className="text-green-400"/>,
        'SESSAO_ENCERRADA': <Square size={16} className="text-red-400"/>,
        'VOTO_REGISTRADO': <Vote size={16} className="text-blue-400"/>,
        'VOTO_SOBRESCRITO': <Edit size={16} className="text-yellow-400"/>,
        'VOTO_CORRIGIDO': <CheckCircle size={16} className="text-yellow-400"/>,
        'PRESENCA_REGISTRADA': <UserCheck size={16} className="text-cyan-400"/>,
        'BACKUP_EXPORTADO': <Download size={16} className="text-purple-400"/>,
        'SISTEMA_RESTAURADO': <Upload size={16} className="text-purple-400"/>,
        'LOGOUT_FORCADO': <UserX size={16} className="text-orange-400"/>,
        'SISTEMA_RESETADO': <AlertTriangle size={16} className="text-red-500"/>,
    };

    const filteredLogs = useMemo(() => {
        return systemLogs
            .filter(log => filterAction ? log.action === filterAction : true)
            .filter(log => filterUser ? log.user.toLowerCase().includes(filterUser.toLowerCase()) : true)
            .sort((a, b) => b.timestamp - a.timestamp);
    }, [systemLogs, filterAction, filterUser]);
    
    const uniqueActions = [...new Set(systemLogs.map(log => log.action))];

    return (
        <Card title="Trilha de Auditoria do Sistema">
            <div className="flex gap-4 mb-4 p-3 bg-sapv-blue-dark rounded-md">
                <div className="flex-1">
                    <label className="text-xs text-sapv-gray">Filtrar por Ação</label>
                    <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="w-full mt-1 p-2 bg-sapv-blue-light border border-sapv-gray-dark rounded-md">
                        <option value="">Todas as Ações</option>
                        {uniqueActions.map(action => <option key={action} value={action}>{action}</option>)}
                    </select>
                </div>
                 <div className="flex-1">
                    <label className="text-xs text-sapv-gray">Filtrar por Usuário</label>
                    <input type="text" value={filterUser} onChange={e => setFilterUser(e.target.value)} placeholder="Nome do usuário..." className="w-full mt-1 p-2 bg-sapv-blue-light border border-sapv-gray-dark rounded-md"/>
                 </div>
            </div>
            <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-2">
                {filteredLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-2 bg-sapv-blue-dark rounded">
                        <div className="mt-1">{logIcons[log.action] || <History size={16}/>}</div>
                        <div>
                            <p className="font-semibold text-sapv-gray-light">
                                <span className="font-mono text-xs text-sapv-gray mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                {log.action} por <span className="text-sapv-highlight">{log.user}</span>
                            </p>
                            {log.details && <p className="text-xs text-sapv-gray">{log.details}</p>}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};

const BackupTab: React.FC = () => {
    const { user } = useAuth();
    const { exportSystemData, importSystemData } = useSession();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExport = () => {
        const jsonData = exportSystemData();
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sapv-backup-${new Date().toISOString()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if(window.confirm("ATENÇÃO: Isto substituirá TODOS os dados atuais do sistema. Deseja continuar?")) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const content = e.target?.result as string;
                    if (!user) throw new Error("Usuário não autenticado");
                    await importSystemData(content, user.name);
                    alert("Sistema restaurado com sucesso a partir do backup!");
                } catch (error) {
                    alert(`Erro ao restaurar backup: ${error}`);
                }
            };
            reader.readAsText(file);
        }
        // Reset file input
        if(fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card title="Exportar Snapshot do Sistema">
                <div className="flex flex-col items-center justify-center text-center h-full">
                    <HardDrive size={48} className="text-sapv-gray mb-4"/>
                    <p className="mb-4">Crie um backup completo do estado atual do sistema (sessão, projetos, logs, etc.) em um arquivo JSON.</p>
                    <Button onClick={handleExport}><Download className="mr-2"/> Baixar Snapshot (.json)</Button>
                </div>
            </Card>
             <Card title="Restaurar Sistema de um Snapshot">
                 <div className="flex flex-col items-center justify-center text-center h-full">
                    <FileJson size={48} className="text-sapv-gray mb-4"/>
                    <p className="mb-4 text-yellow-300"><AlertTriangle className="inline mr-1"/>Atenção: A restauração substituirá todos os dados atuais. Use com cautela.</p>
                    <Button onClick={handleImportClick} variant="secondary"><Upload className="mr-2"/> Carregar Arquivo de Backup</Button>
                    <input type="file" accept=".json" ref={fileInputRef} onChange={handleFileChange} className="hidden"/>
                </div>
            </Card>
        </div>
    );
};

const EmergencyTab: React.FC = () => {
    const { user } = useAuth();
    const { session, councilMembers, adminFixVote, forceLogout, resetSystem } = useSession();
    const [fixVoteMember, setFixVoteMember] = useState('');
    const [fixVoteValue, setFixVoteValue] = useState<VoteOption | ''>('');

    const handleFixVote = (e: React.FormEvent) => {
        e.preventDefault();
        if (fixVoteMember && fixVoteValue && user && session.currentProject) {
            adminFixVote(fixVoteMember, fixVoteValue, user.name);
            alert("Voto corrigido com sucesso!");
            setFixVoteMember('');
            setFixVoteValue('');
        }
    };
    
    const presentUsers = councilMembers.filter(m => session.presence[m.uid]);

    return (
        <div className="space-y-8">
            <Card title="Correção Manual de Voto" className="border-yellow-500/50">
                <form onSubmit={handleFixVote} className="space-y-3 max-w-lg mx-auto">
                    <p className="text-xs text-yellow-300">Use para corrigir um voto após o encerramento da votação, por erro de registro. A ação será auditada.</p>
                    <p className="text-sm">Projeto: <span className="font-bold">{session.currentProject?.title || "Nenhum"}</span></p>
                     <select value={fixVoteMember} onChange={e => setFixVoteMember(e.target.value)} className="w-full p-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" disabled={!session.currentProject}>
                        <option value="">Selecione o Vereador</option>
                        {councilMembers.map(m => <option key={m.uid} value={m.uid}>{m.name}</option>)}
                    </select>
                     <select value={fixVoteValue} onChange={e => setFixVoteValue(e.target.value as VoteOption)} className="w-full p-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" disabled={!session.currentProject}>
                        <option value="">Selecione o Voto</option>
                        {Object.values(VoteOption).map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <Button type="submit" className="w-full" variant="secondary" disabled={!fixVoteMember || !fixVoteValue}>Corrigir Voto</Button>
                </form>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                 <Card title="Sessões Ativas (Kick)" className="border-orange-500/50">
                     <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {presentUsers.map(u => (
                            <div key={u.uid} className="flex justify-between items-center bg-sapv-blue-dark p-2 rounded">
                                <span>{u.name}</span>
                                <Button size="sm" variant="danger" onClick={() => user && forceLogout(u.uid, user.name)}>Desconectar</Button>
                            </div>
                         ))}
                         {presentUsers.length === 0 && <p className="text-sapv-gray text-center">Nenhum usuário presente.</p>}
                     </div>
                 </Card>
                 <Card title="Factory Reset" className="border-red-500/50">
                    <div className="p-4 bg-red-900/50 border border-red-500 rounded-md text-center">
                        <h3 className="font-bold text-lg text-red-300 flex items-center justify-center"><AlertTriangle className="mr-2"/> Reset Total</h3>
                        <p className="text-sm text-red-200 mt-1 mb-3">Limpa TODOS os dados e recarrega a aplicação. Use como último recurso.</p>
                        <Button variant="danger" onClick={resetSystem}><Trash2 className="mr-2"/> RESETAR SISTEMA</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

const SupportDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('diagnostico');

    const renderContent = () => {
        switch (activeTab) {
            case 'diagnostico': return <HealthCheckTab />;
            case 'auditoria': return <AuditTab />;
            case 'backup': return <BackupTab />;
            case 'perigo': return <EmergencyTab />;
        }
    };
    
    const TabButton: React.FC<{tabId: string, label: string, icon: React.ReactNode}> = ({tabId, label, icon}) => (
        <button 
            onClick={() => setActiveTab(tabId)} 
            className={`w-full flex items-center space-x-3 px-4 py-3 text-left font-semibold transition-all duration-300 rounded-md ${activeTab === tabId ? 'bg-sapv-blue-light text-sapv-highlight' : 'text-sapv-gray hover:bg-sapv-blue-dark hover:text-sapv-gray-light'}`}
        >
            {icon}
            <span>{label}</span>
        </button>
    )

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
            <header className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold">Painel de Suporte Técnico</h1>
                    <p className="text-sapv-gray">Logado como: {user?.name}</p>
                </div>
                <Button onClick={logout} variant="danger">
                    <LogOut className="inline-block mr-2" size={16} /> Sair
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <aside className="lg:col-span-1">
                    <Card className="space-y-2">
                        <TabButton tabId="diagnostico" label="Diagnóstico" icon={<Activity size={20} />} />
                        <TabButton tabId="auditoria" label="Auditoria" icon={<History size={20} />} />
                        <TabButton tabId="backup" label="Backup & Recovery" icon={<HardDrive size={20} />} />
                        <TabButton tabId="perigo" label="Zona de Perigo" icon={<ShieldAlert size={20} />} />
                    </Card>
                </aside>
                <main className="lg:col-span-3">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default SupportDashboard;