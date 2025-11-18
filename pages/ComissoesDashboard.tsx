import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { LogOut, CheckCircle, XCircle } from 'lucide-react';
import { Project, Parecer } from '../types';

interface ParecerModalProps {
    project: Project;
    commissionId: string;
    onClose: () => void;
}

const ParecerModal: React.FC<ParecerModalProps> = ({ project, commissionId, onClose }) => {
    const { user } = useAuth();
    const { addParecer, commissions } = useSession();
    const [content, setContent] = useState('');
    const [status, setStatus] = useState<'Favorável' | 'Contrário'>('Favorável');

    const commission = commissions.find(c => c.id === commissionId);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !content.trim() || !commission) return;
        const parecer: Omit<Parecer, 'id' | 'date'> = {
            commissionId,
            commissionName: commission.name,
            author: user,
            content,
            status,
        };
        addParecer(project.id, parecer);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <Card title={`Emitir Parecer - ${commission?.name}`} className="w-full max-w-2xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <p className="font-bold">{project.title}</p>
                    <div>
                        <label className="block text-sm font-medium mb-1">Texto do Parecer</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} required
                                  className="w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Voto do Relator</label>
                        <div className="flex gap-4">
                            <Button type="button" onClick={() => setStatus('Favorável')} variant={status === 'Favorável' ? 'success' : 'secondary'}>Favorável</Button>
                            <Button type="button" onClick={() => setStatus('Contrário')} variant={status === 'Contrário' ? 'danger' : 'secondary'}>Contrário</Button>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-sapv-gray-dark">
                        <Button type="button" variant="secondary" onClick={onClose}>Cancelar</Button>
                        <Button type="submit">Enviar Parecer</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
};


const ComissoesDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { projects, commissions } = useSession();
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [selectedCommissionId, setSelectedCommissionId] = useState<string | null>(null);

    const myCommissions = useMemo(() => {
        if (!user) return [];
        // Fix: Access uid via member.profile.uid
        return commissions.filter(c => c.members.some(m => m.profile.uid === user.uid));
    }, [commissions, user]);

    const projectsInMyCommissions = useMemo(() => {
        const commissionIds = myCommissions.map(c => c.id);
        return projects.filter(p =>
            p.workflowStatus === 'Nas Comissões' &&
            p.assignedCommissionIds?.some(id => commissionIds.includes(id))
        );
    }, [projects, myCommissions]);
    
    const openParecerModal = (project: Project, commissionId: string) => {
        setSelectedProject(project);
        setSelectedCommissionId(commissionId);
    };

    if (!user) return null;

    return (
        <>
            <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Painel das Comissões</h1>
                        <p className="text-sapv-gray">Vereador: {user.name}</p>
                    </div>
                    <Button onClick={logout} variant="danger"><LogOut className="inline mr-2" size={16}/> Sair</Button>
                </header>

                <div className="space-y-8">
                    {myCommissions.map(commission => {
                        const commissionProjects = projectsInMyCommissions.filter(p => p.assignedCommissionIds?.includes(commission.id));

                        return (
                            <Card key={commission.id} title={commission.name}>
                                {commissionProjects.length > 0 ? (
                                    <div className="space-y-3">
                                        {commissionProjects.map(p => {
                                            const parecer = p.pareceres?.find(par => par.commissionId === commission.id);
                                            return (
                                                <div key={p.id} className="bg-sapv-blue-dark p-4 rounded-md flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold">{p.title}</p>
                                                        <p className="text-sm text-sapv-gray">Autor: {p.author.name}</p>
                                                    </div>
                                                    <div>
                                                        {parecer ? (
                                                            <div className="text-right">
                                                                <p className={`flex items-center text-sm font-bold ${parecer.status === 'Favorável' ? 'text-green-400' : 'text-red-400'}`}>
                                                                    {parecer.status === 'Favorável' ? <CheckCircle size={16} className="mr-2"/> : <XCircle size={16} className="mr-2"/>}
                                                                    Parecer {parecer.status}
                                                                </p>
                                                                <p className="text-xs text-sapv-gray mt-1">por {parecer.author.name}</p>
                                                            </div>
                                                        ) : (
                                                            <Button size="sm" onClick={() => openParecerModal(p, commission.id)}>Emitir Parecer</Button>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-sapv-gray text-center py-4">Nenhum projeto pendente de parecer nesta comissão.</p>
                                )}
                            </Card>
                        )
                    })}
                </div>
            </div>
            {selectedProject && selectedCommissionId && (
                <ParecerModal project={selectedProject} commissionId={selectedCommissionId} onClose={() => { setSelectedProject(null); setSelectedCommissionId(null); }} />
            )}
        </>
    );
};

export default ComissoesDashboard;
