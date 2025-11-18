import React, { useState, useEffect } from 'react';
import { useSession } from '../../context/SessionContext';
import { Project, Amendment } from '../../types';
import Button from '../common/Button';
import { PlusCircle, Edit, Trash2, CheckCircle } from 'lucide-react';

interface ProjectAmendmentsDetailProps {
  project: Project;
}

export const ProjectAmendmentsDetail: React.FC<ProjectAmendmentsDetailProps> = ({ project }) => {
  const { councilMembers, addAmendment, updateAmendment, deleteAmendment } = useSession();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorId, setAuthorId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [editingAmendment, setEditingAmendment] = useState<Amendment | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      newErrors.title = "O título da emenda é obrigatório.";
    } else if (trimmedTitle.length < 5) {
      newErrors.title = "O título deve ter pelo menos 5 caracteres.";
    } else {
      const isDuplicate = project.amendments?.some(
        amend => amend.title.toLowerCase() === trimmedTitle.toLowerCase() && amend.id !== editingAmendment?.id
      );
      if (isDuplicate) {
        newErrors.title = "Já existe uma emenda com este título para este projeto.";
      }
    }

    if (!authorId) {
      newErrors.authorId = "Selecione um autor para a emenda.";
    }

    if (!description.trim()) {
      newErrors.description = "O texto da emenda é obrigatório.";
    } else if (description.trim().length < 10) {
      newErrors.description = "O texto da emenda deve ter pelo menos 10 caracteres.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  const clearError = (field: string) => {
    if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
    }
  }

  const handleEditClick = (amendment: Amendment) => {
    setEditingAmendment(amendment);
    setTitle(amendment.title);
    setDescription(amendment.description);
    setAuthorId(amendment.author.uid);
    setErrors({});
    setSuccessMessage('');
  };

  const handleCancelEdit = () => {
    setEditingAmendment(null);
    setTitle('');
    setDescription('');
    setAuthorId('');
    setErrors({});
  };

  const handleDeleteClick = (amendment: Amendment) => {
    if (window.confirm(`Tem certeza que deseja excluir a emenda "${amendment.title}"?`)) {
      deleteAmendment(amendment.id, project.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    const author = councilMembers.find(m => m.uid === authorId);
    if (!author) return;

    if (editingAmendment) {
        updateAmendment({
            ...editingAmendment,
            title,
            description,
            author,
        });
        setSuccessMessage('Emenda atualizada com sucesso!');
    } else {
      const newAmendmentData: Omit<Amendment, 'id'> = {
        parentProjectId: project.id,
        title,
        description,
        author,
      };
      addAmendment(newAmendmentData);
      setSuccessMessage('Emenda adicionada com sucesso!');
    }

    handleCancelEdit();
  };

  return (
    <div className="p-6 bg-sapv-blue-dark">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* List of Existing Amendments */}
          <section>
            <h3 className="text-lg font-semibold text-sapv-highlight mb-4">Emendas Apresentadas ({project.amendments?.length || 0})</h3>
            <div className="space-y-3 pr-2 max-h-80 overflow-y-auto">
              {project.amendments && project.amendments.length > 0 ? (
                project.amendments.map(amend => (
                  <div key={amend.id} className="bg-sapv-blue-light/50 p-3 rounded-md">
                    <p className="font-semibold">{amend.title}</p>
                    <p className="text-xs text-sapv-gray my-1">{amend.description}</p>
                    <p className="text-xs text-sapv-gray-dark mt-1">Autor: {amend.author.name}</p>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-sapv-gray-dark/50">
                        <Button size="sm" variant="secondary" onClick={() => handleEditClick(amend)} className="text-xs !py-1 !px-2 flex items-center"><Edit size={12} className="mr-1"/> Editar</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDeleteClick(amend)} className="text-xs !py-1 !px-2 flex items-center"><Trash2 size={12} className="mr-1"/> Excluir</Button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sapv-gray text-center py-8">Nenhuma emenda para este projeto.</p>
              )}
            </div>
          </section>

          {/* Form to Add New Amendment */}
          <section className="border-t md:border-t-0 md:border-l border-sapv-gray-dark pt-6 md:pt-0 md:pl-6">
            <h3 className="text-lg font-semibold text-sapv-highlight mb-4">{editingAmendment ? 'Editar Emenda' : 'Adicionar Nova Emenda'}</h3>
             {successMessage && (
              <div className="bg-green-900/50 border border-green-700 text-green-300 px-4 py-3 rounded-md relative mb-4 text-sm flex items-center" role="alert">
                <CheckCircle size={16} className="mr-2" />
                <span className="block sm:inline">{successMessage}</span>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor={`amend-title-${project.id}`} className="block text-sm font-medium">Título da Emenda</label>
                <input id={`amend-title-${project.id}`} type="text" value={title} 
                       onChange={(e) => { setTitle(e.target.value); clearError('title'); }} 
                       className={`mt-1 w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-light/50 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.title ? 'border-red-500' : 'border-sapv-gray-dark'}`} 
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
              </div>
              <div>
                <label htmlFor={`amend-author-${project.id}`} className="block text-sm font-medium">Autor</label>
                <select id={`amend-author-${project.id}`} value={authorId} 
                        onChange={e => { setAuthorId(e.target.value); clearError('authorId'); }} 
                        className={`mt-1 w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-light/50 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.authorId ? 'border-red-500' : 'border-sapv-gray-dark'}`}
                >
                  <option value="">Selecione um vereador</option>
                  {councilMembers.map(c => <option key={c.uid} value={c.uid}>{c.name}</option>)}
                </select>
                {errors.authorId && <p className="text-red-400 text-xs mt-1">{errors.authorId}</p>}
              </div>
              <div>
                <label htmlFor={`amend-desc-${project.id}`} className="block text-sm font-medium">Texto da Emenda</label>
                <textarea id={`amend-desc-${project.id}`} value={description} 
                          onChange={(e) => { setDescription(e.target.value); clearError('description'); }} 
                          rows={4} 
                          className={`mt-1 w-full px-3 py-2 text-sapv-gray-light bg-sapv-blue-light/50 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${errors.description ? 'border-red-500' : 'border-sapv-gray-dark'}`} 
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" className="w-full">
                  {editingAmendment 
                      ? <><Edit size={16} className="mr-2" /> Salvar Alterações</> 
                      : <><PlusCircle size={16} className="mr-2" /> Adicionar Emenda</>
                  }
                </Button>
                {editingAmendment && (
                    <Button type="button" variant="secondary" onClick={handleCancelEdit} className="w-full">Cancelar Edição</Button>
                )}
              </div>
            </form>
          </section>
        </div>
    </div>
  );
};