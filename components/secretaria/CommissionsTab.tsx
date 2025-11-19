
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { UserProfile } from '../../types';
import { PlusCircle, Users, X } from 'lucide-react';

export const CommissionsTab: React.FC = () => {
    const { commissions, councilMembers, addCommission } = useSession();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState<{ profile: UserProfile, role: 'Presidente' | 'Relator' | 'Membro' }[]>([]);
    const [errors, setErrors] = useState<{ [key: string]: string }>({});
    
    const handleAddMember = (member: UserProfile) => {
        if (!selectedMembers.some(m => m.profile.uid === member.uid)) {
            setSelectedMembers([...selectedMembers, { profile: member, role: 'Membro' }]);
        }
    };
    
    const handleRemoveMember = (uid: string) => {
        setSelectedMembers(selectedMembers.filter(m => m.profile.uid !== uid));
    };

    const handleRoleChange = (uid: string, role: 'Presidente' | 'Relator' | 'Membro') => {
        setSelectedMembers(selectedMembers.map(m => m.profile.uid === uid ? { ...m, role } : m));
    };
    
    const validate = () => {
        const newErrors: { [key: string]: string } = {};
        if (!name.trim()) newErrors.name = "O nome da comissão é obrigatório.";
        if (!description.trim()) newErrors.description = "A descrição é obrigatória.";
        if (selectedMembers.length === 0) newErrors.members = "A comissão deve ter pelo menos um membro.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        addCommission({ name, description, members: selectedMembers });
        setName('');
        setDescription('');
        setSelectedMembers([]);
        setErrors({});
    };
    
    const clearError = (field: string) => {
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    const availableMembers = councilMembers.filter(cm => !selectedMembers.some(sm => sm.profile.uid === cm.uid));

    return (
        <div className="space-y-8">
            <Card title="Cadastrar Nova Comissão">
                <form onSubmit={handleSubmit} className="space-y-4">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium">Nome da Comissão</label>
                            <input type="text" value={name} onChange={e => { setName(e.target.value); clearError('name'); }} className={`mt-1 w-full px-3 py-2 bg-sapv-blue-dark border rounded-md ${errors.name ? 'border-red-500' : 'border-sapv-gray-dark'}`} />
                            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium">Descrição</label>
                            <input type="text" value={description} onChange={e => { setDescription(e.target.value); clearError('description'); }} className={`mt-1 w-full px-3 py-2 bg-sapv-blue-dark border rounded-md ${errors.description ? 'border-red-500' : 'border-sapv-gray-dark'}`} />
                             {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
                        </div>
                    </div>
                    <div>
                         <label className="block text-sm font-medium mb-2">Membros da Comissão</label>
                         <div className={`p-3 bg-sapv-blue-dark rounded-md min-h-[48px] border ${errors.members ? 'border-red-500' : 'border-sapv-gray-dark'}`}>
                             {selectedMembers.length > 0 ? (
                                <div className="space-y-2">
                                    {selectedMembers.map(m => (
                                        <div key={m.profile.uid} className="flex items-center gap-2 bg-sapv-blue-light p-2 rounded">
                                            <span className="flex-grow font-semibold">{m.profile.name}</span>
                                            <select value={m.role} onChange={e => handleRoleChange(m.profile.uid, e.target.value as any)} className="bg-sapv-gray-dark text-white rounded px-2 py-1 text-xs">
                                                <option>Membro</option>
                                                <option>Relator</option>
                                                <option>Presidente</option>
                                            </select>
                                            <Button type="button" size="sm" variant="danger" onClick={() => handleRemoveMember(m.profile.uid)} className="!p-1 h-6 w-6"><X size={14}/></Button>
                                        </div>
                                    ))}
                                </div>
                             ) : <p className="text-sm text-sapv-gray">Nenhum membro selecionado.</p>}
                         </div>
                         {errors.members && <p className="text-red-400 text-xs mt-1">{errors.members}</p>}
                    </div>
                     <div>
                        <label className="block text-sm font-medium mb-1">Adicionar Vereador à Comissão</label>
                        <div className="flex flex-wrap gap-2">
                            {availableMembers.map(m => (
                                <Button type="button" key={m.uid} size="sm" variant="secondary" onClick={() => { handleAddMember(m); clearError('members'); }}>+ {m.name}</Button>
                            ))}
                        </div>
                    </div>
                     <Button type="submit" className="w-full"><PlusCircle size={16} className="mr-2"/> Criar Comissão</Button>
                </form>
            </Card>

            <Card title="Comissões Existentes">
                 <div className="space-y-4">
                    {commissions.length > 0 ? commissions.map(c => (
                        <div key={c.id} className="p-4 bg-sapv-blue-dark rounded-md border border-sapv-gray-dark">
                            <h3 className="font-bold text-lg text-sapv-gray-light">{c.name}</h3>
                            <p className="text-sm text-sapv-gray mb-3">{c.description}</p>
                             <div className="border-t border-sapv-gray-dark pt-3">
                                <span className="flex items-center text-xs font-semibold text-sapv-gray mb-2"><Users size={14} className="mr-2"/> Membros:</span>
                                <div className="flex flex-wrap gap-2">
                                    {c.members.map(m => (
                                        <span key={m.profile.uid} className="px-2 py-1 bg-sapv-gray-dark text-sapv-gray-light text-xs rounded-full">
                                            {m.profile.name} <span className="text-sapv-gray">({m.role})</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )) : <p className="text-center text-sapv-gray py-8">Nenhuma comissão cadastrada.</p>}
                 </div>
            </Card>
        </div>
    );
};
