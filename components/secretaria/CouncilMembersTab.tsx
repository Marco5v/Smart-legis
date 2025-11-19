
import React from 'react';
import Card from '../common/Card';
import { useSession } from '../../context/SessionContext';

export const CouncilMembersTab: React.FC = () => {
    const { councilMembers } = useSession();

    return (
        <Card title="Gestão de Vereadores">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sapv-gray-light">
                    <thead className="border-b border-sapv-gray-dark text-sm text-sapv-gray">
                        <tr>
                            <th className="p-4">Foto</th>
                            <th className="p-4">Nome Parlamentar</th>
                            <th className="p-4">Partido</th>
                            <th className="p-4">E-mail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {councilMembers.map(c => (
                            <tr key={c.uid} className="border-b border-sapv-gray-dark hover:bg-sapv-blue-light/50 transition-colors">
                                <td className="p-4">
                                    <img src={c.photoUrl} alt={c.name} className="w-12 h-12 rounded-full"/>
                                </td>
                                <td className="p-4 font-bold">{c.name}</td>
                                <td className="p-4">{c.party}</td>
                                <td className="p-4">{c.email}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};
