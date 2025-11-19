

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from '../../context/SessionContext';
// FIX: Import ProjectWorkflowStatus for type safety
import { Project, MajorityType, VotingType, ProjectWorkflowStatus } from '../../types';
import Button from '../common/Button';
import { PlusCircle, X, Save } from 'lucide-react';

interface ProjectFormModalProps {
  project: Project | null;
  onClose: () => void;
}

const matterTypes = ["PROJETO DE DECRETO LEGISLATIVO", "PROJETO DE LEI LEGISLATIVO", "PROJETO DE LEI DO EXECUTIVO", "REQUERIMENTO", "VOTAÇÃO EM BLOCO", "EMENDA", "SUBSTITUTIVO", "OUTROS"];
const proposingInstitutions = ["CÂMARA MUNICIPAL", "EXECUTIVO MUNICIPAL", "AÇÃO PÚBLICA", "OUTROS"];
const votingTurns = ["Turno Único", "2 Turnos", "3 Turnos"];
const secretVoteOptions = ["NÃO", "SIM"];

const ProposerSelector: React.FC<{selected: string, onSelect: (uid: string) => void, error?: string}> = ({ selected, onSelect, error }) => {
    const { councilMembers } = useSession();
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef<HTMLDivElement>(null);

    const selectedMember = councilMembers.find(c => c.uid === selected);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);
    
    const filteredMembers = councilMembers.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="relative" ref={wrapperRef}>
            <label className="block text-sm font-medium">Propositor</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`mt-1 w-full p-2 bg-sapv-blue-dark border rounded-md flex items-center justify-between cursor-pointer ${error ? 'border-red-500' : 'border-sapv-gray-dark'}`}>
                {selectedMember ? (
                    <div className="flex items-center gap-2">
                        <img src={selectedMember.photoUrl} className="w-6 h-6 rounded-full" />
                        <span>{selectedMember.name} <span className="text-xs text-sapv-gray">({selectedMember.party})</span></span>
                    </div>
                ) : (
                    <span className="text-sapv-gray">Selecione o Propositor</span>
                )}
                <span>▼</span>
            </div>
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-sapv-blue-light border border-sapv-gray-dark rounded-md shadow-lg max-h-60 overflow-y-auto">
                    <input type="text" placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-3 py-2 bg-sapv-blue-dark border-b border-sapv-gray-dark" />
                    <ul>
                        {filteredMembers.map(member => (
                            <li key={member.uid} onClick={() => { onSelect(member.uid); setIsOpen(false); setSearchTerm(''); }} className="p-2 hover:bg-sapv-blue-dark cursor-pointer flex items-center gap-2">
                                <img src={member.photoUrl} className="w-8 h-8 rounded-full" />
                                <div>
                                    <p>{member.name}</p>
                                    <p className="text-xs text-sapv-gray">{member.party}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ project, onClose }) => {
    const { councilMembers, addProject, sessionHistory, projects } = useSession();
    const [formData, setFormData] = useState({
        number: project?.number || '',
        date: project?.date || new Date().toISOString().split('T')[0],
        proposingInstitution: project?.proposingInstitution || '',
        authorId: project?.author?.uid || '',
        matterType: project?.matterType || '',
        votingType: project?.votingRules.type || VotingType.NOMINAL,
        majorityType: project?.votingRules.majority || MajorityType.SIMPLES,
        turns: project?.turns || 'Turno Único',
        secretVote: project?.secretVote ? 'SIM' : 'NÃO',
        description: project?.description || '',
        readInSessionId: project?.readInSessionId || '',
        votedInSessionId: project?.votedInSessionId || '',
        parentProjectId: project?.parentProjectId || '',
    });
    const [errors, setErrors] = useState<{ [key: string]: string }>({});

    const isSubordinate = formData.matterType === 'EMENDA' || formData.matterType === 'SUBSTITUTIVO';

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.authorId || !formData.matterType || !formData.description) {
            alert('Preencha os campos obrigatórios.');
            return;
        }
        
        const author = councilMembers.find(c => c.uid === formData.authorId);
        if (!author) return;
        
        const projectData: Omit<Project, 'id' | 'votingStatus' | 'amendments' | 'pareceres' | 'transmittalHistory'> = {
            number: formData.number,
            date: formData.date,
            title: `${formData.matterType} Nº ${formData.number}`,
            description: formData.description,
            author,
            proposingInstitution: formData.proposingInstitution,
            matterType: formData.matterType,
            // FIX: Use enum member instead of string literal
            workflowStatus: ProjectWorkflowStatus.PROTOCOLADO,
            votingRules: {
                type: formData.votingType as VotingType,
                majority: formData.majorityType as MajorityType,
            },
            turns: formData.turns as any,
            secretVote: formData.secretVote === 'SIM',
            readInSessionId: formData.readInSessionId,
            votedInSessionId: formData.votedInSessionId,
            parentProjectId: isSubordinate ? formData.parentProjectId : undefined,
        };

        if (project) {
            // TODO: updateProject(project.id, projectData);
        } else {
            addProject(projectData);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <form onSubmit={handleSubmit} className="bg-sapv-blue-light rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <header className="flex justify-between items-center p-4 border-b border-sapv-gray-dark">
                    <h2 className="text-2xl font-bold text-sapv-gray-light">{project ? 'Editar Projeto' : 'Adicionar Novo Projeto'}</h2>
                    <Button onClick={onClose} type="button" variant="secondary" size="sm" className="!p-2"><X size={20} /></Button>
                </header>

                <main className="flex-grow p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                         <div className="md:col-span-1">
                            <label htmlFor="number" className="block text-sm font-medium">Núm./Exercício</label>
                            <input id="number" name="number" type="text" value={formData.number} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" />
                        </div>
                        <div className="md:col-span-1">
                            <label htmlFor="date" className="block text-sm font-medium">Data</label>
                            <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" />
                        </div>
                        <div className="md:col-span-2">
                             <label htmlFor="proposingInstitution" className="block text-sm font-medium">Instituição Propositora</label>
                            <select id="proposingInstitution" name="proposingInstitution" value={formData.proposingInstitution} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Selecione...</option>
                                {proposingInstitutions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ProposerSelector selected={formData.authorId} onSelect={(uid) => setFormData(p => ({...p, authorId: uid}))} />
                        <div>
                             <label htmlFor="matterType" className="block text-sm font-medium">Tipo de Matéria</label>
                            <select id="matterType" name="matterType" value={formData.matterType} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Selecione...</option>
                                {matterTypes.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    {isSubordinate && (
                         <div>
                             <label htmlFor="parentProjectId" className="block text-sm font-medium">Vincular ao Projeto Principal</label>
                            <select id="parentProjectId" name="parentProjectId" value={formData.parentProjectId} onChange={handleChange} required={isSubordinate} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Selecione o projeto principal...</option>
                                {projects.filter(p => !p.parentProjectId).map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border-t border-sapv-gray-dark pt-4">
                         <div>
                             <label htmlFor="majorityType" className="block text-sm font-medium">Tipo de Votação</label>
                            <select id="majorityType" name="majorityType" value={formData.majorityType} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                {Object.values(MajorityType).map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                         <div>
                             <label htmlFor="turns" className="block text-sm font-medium">Turnos</label>
                            <select id="turns" name="turns" value={formData.turns} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                {votingTurns.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                         <div>
                             <label htmlFor="secretVote" className="block text-sm font-medium">Voto Secreto</label>
                            <select id="secretVote" name="secretVote" value={formData.secretVote} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                {secretVoteOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="description" className="block text-sm font-medium">Ementa / Resumo da Matéria</label>
                        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={4} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-sapv-gray-dark pt-4">
                        <div>
                            <label htmlFor="readInSessionId" className="block text-sm font-medium">Leitura</label>
                            <select id="readInSessionId" name="readInSessionId" value={formData.readInSessionId} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Não se aplica</option>
                                {sessionHistory.map(s => <option key={s.sessionId} value={s.sessionId}>Sessão de {new Date(s.date).toLocaleDateString('pt-BR')}</option>)}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="votedInSessionId" className="block text-sm font-medium">Votação</label>
                            <select id="votedInSessionId" name="votedInSessionId" value={formData.votedInSessionId} onChange={handleChange} className="mt-1 w-full px-3 py-2 bg-sapv-blue-dark border border-sapv-gray-dark rounded-md">
                                <option value="">Não se aplica</option>
                                 {sessionHistory.map(s => <option key={s.sessionId} value={s.sessionId}>Sessão de {new Date(s.date).toLocaleDateString('pt-BR')}</option>)}
                            </select>
                        </div>
                    </div>
                </main>

                <footer className="p-4 border-t border-sapv-gray-dark flex justify-end">
                    <Button type="submit">
                        {project ? <><Save className="mr-2" size={16}/> Salvar Alterações</> : <><PlusCircle className="mr-2" size={16}/> Salvar</>}
                    </Button>
                </footer>
            </form>
        </div>
    );
};
