import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusCircle, ChevronDown, ChevronRight, Edit, FileText, History, Info } from 'lucide-react';
import { useSession } from '../../context/SessionContext';
import { Project, ProjectWorkflowStatus } from '../../types';
import { ProjectAmendmentsDetail } from './ProjectAmendmentsDetail';
import { ProjectFormModal } from './ProjectFormModal';
import { ProjectHistoryDetail } from './ProjectHistoryDetail';

const getStatusBadgeStyle = (status: ProjectWorkflowStatus) => {
    switch (status) {
        case 'Pronto para Pauta':
            return 'bg-green-500/30 text-green-300';
        case 'Nas Comissões':
        case 'Aguardando Parecer':
            return 'bg-yellow-500/30 text-yellow-300';
        case 'Protocolado':
            return 'bg-blue-500/30 text-blue-300';
        case 'Lido em Plenário':
            return 'bg-purple-500/30 text-purple-300';
        case 'Arquivado':
        case 'Prejudicado':
            return 'bg-gray-500/30 text-gray-300';
        default:
            return 'bg-sapv-gray-dark text-sapv-gray-light';
    }
};

const ProjectDetailTabs: React.FC<{ project: Project }> = ({ project }) => {
    const [activeTab, setActiveTab] = useState('amendments');

    return (
        <div className="p-4 bg-sapv-blue-dark">
            <div className="flex border-b border-sapv-gray-dark mb-4">
                <button onClick={() => setActiveTab('amendments')} className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'amendments' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>
                    <Info size={16} /> Detalhes e Emendas
                </button>
                <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-semibold flex items-center gap-2 ${activeTab === 'history' ? 'border-b-2 border-sapv-highlight text-sapv-highlight' : 'text-sapv-gray'}`}>
                    <History size={16} /> Histórico
                </button>
            </div>
            <div>
                {activeTab === 'amendments' && <ProjectAmendmentsDetail project={project} />}
                {activeTab === 'history' && <ProjectHistoryDetail project={project} />}
            </div>
        </div>
    );
};

export const ProjectsTab: React.FC = () => {
    const { projects } = useSession();
    const [expandedProjectId, setExpandedProjectId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const itemsPerPage = 10;
    const totalPages = Math.ceil(projects.length / itemsPerPage);
    const paginatedProjects = projects.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleToggleExpand = (projectId: string) => {
        setExpandedProjectId(prevId => (prevId === projectId ? null : projectId));
    };

    const handleOpenModal = (project: Project | null) => {
        setEditingProject(project);
        setIsModalOpen(true);
    };

    const goToNextPage = () => {
        setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    };

    const goToPreviousPage = () => {
        setCurrentPage((prev) => Math.max(prev - 1, 1));
    };

    return (
        <>
            <Card title="Tramitação de Projetos">
                <div className="flex justify-end mb-4">
                    <Button onClick={() => handleOpenModal(null)}>
                        <PlusCircle className="inline-block mr-2" size={16} /> Adicionar Projeto
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-sapv-gray-dark text-xs text-sapv-gray uppercase sticky top-0 bg-sapv-blue-light">
                            <tr>
                                <th className="p-4 w-8"></th>
                                <th className="p-4">Num./Exercício</th>
                                <th className="p-4">Tipo de Matéria</th>
                                <th className="p-4">Data</th>
                                <th className="p-4">Ementa</th>
                                <th className="p-4">Propositor</th>
                                <th className="p-4">Status</th>
                                <th className="p-4">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProjects.map(p => (
                                <React.Fragment key={p.id}>
                                    <tr className="border-b border-sapv-gray-dark hover:bg-sapv-blue-dark/50 transition-colors">
                                        <td className="p-4 align-top">
                                            <button onClick={() => handleToggleExpand(p.id)} className="text-sapv-gray hover:text-sapv-highlight">
                                                {expandedProjectId === p.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                            </button>
                                        </td>
                                        <td className="p-4 font-semibold text-sapv-gray-light align-top">{p.number}</td>
                                        <td className="p-4 align-top">{p.matterType}</td>
                                        <td className="p-4 align-top">{p.date ? new Date(p.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</td>
                                        <td className="p-4 align-top max-w-xs truncate">{p.description}</td>
                                        <td className="p-4 align-top">{p.author.name}</td>
                                        <td className="p-4 align-top">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${getStatusBadgeStyle(p.workflowStatus)}`}>
                                                {p.workflowStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 align-top">
                                            <div className="flex items-center gap-2">
                                                <Button size="sm" variant="secondary" onClick={() => handleOpenModal(p)} className="!p-2"><Edit size={14}/></Button>
                                                <Button size="sm" variant="secondary" className="!p-2"><FileText size={14}/></Button>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedProjectId === p.id && (
                                        <tr className="border-b border-sapv-gray-dark">
                                            <td colSpan={8}>
                                                <ProjectDetailTabs project={p} />
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-sapv-gray-dark">
                        <Button onClick={goToPreviousPage} disabled={currentPage === 1} variant="secondary">
                            Anterior
                        </Button>
                        <span className="text-sm text-sapv-gray">
                            Página {currentPage} de {totalPages}
                        </span>
                        <Button onClick={goToNextPage} disabled={currentPage === totalPages} variant="secondary">
                            Próximo
                        </Button>
                    </div>
                )}
            </Card>
            {isModalOpen && (
                <ProjectFormModal project={editingProject} onClose={() => setIsModalOpen(false)} />
            )}
        </>
    );
};