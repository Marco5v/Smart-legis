import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { PlusCircle, ChevronDown, ChevronRight, Edit, History, Info } from 'lucide-react';
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

const ProjectItem: React.FC<{
    project: Project;
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEdit: () => void;
}> = ({ project, isExpanded, onToggleExpand, onEdit }) => {
    return (
        <div className="bg-sapv-blue-light border border-sapv-gray-dark rounded-lg shadow-md transition-shadow hover:shadow-lg">
            <div className="p-4 flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full whitespace-nowrap ${getStatusBadgeStyle(project.workflowStatus)}`}>
                            {project.workflowStatus}
                        </span>
                        <h3 className="font-bold text-base text-sapv-gray-light leading-tight">
                            {project.title}
                        </h3>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-sapv-gray">
                        <span><strong>Nº:</strong> {project.number}</span>
                        <span><strong>Data:</strong> {project.date ? new Date(project.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}</span>
                        <span><strong>Autor:</strong> {project.author.name}</span>
                    </div>
                    <p className="mt-3 text-sm text-sapv-gray-light max-w-2xl">
                        {project.description}
                    </p>
                </div>
                <div className="flex-shrink-0 flex items-center gap-2 self-start md:self-center">
                    <Button size="sm" variant="secondary" onClick={onEdit} className="!p-2" title="Editar Projeto">
                        <Edit size={16} />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={onToggleExpand} className="!p-2" title={isExpanded ? "Ocultar Detalhes" : "Mostrar Detalhes"}>
                        {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </Button>
                </div>
            </div>
            {isExpanded && (
                <div className="border-t border-sapv-gray-dark bg-sapv-blue-dark">
                    <ProjectDetailTabs project={project} />
                </div>
            )}
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
                <div className="space-y-4">
                    {paginatedProjects.map(p => (
                         <ProjectItem
                            key={p.id}
                            project={p}
                            isExpanded={expandedProjectId === p.id}
                            onToggleExpand={() => handleToggleExpand(p.id)}
                            onEdit={() => handleOpenModal(p)}
                        />
                    ))}
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
