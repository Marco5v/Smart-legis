import React from 'react';
import Card from '../common/Card';
import { useSession } from '../../context/SessionContext';

export const PartiesTab: React.FC = () => {
    const { parties } = useSession();

    return (
        <Card title="Gestão de Partidos">
             <div className="overflow-x-auto">
                <table className="w-full text-left text-sapv-gray-light">
                    <thead className="border-b border-sapv-gray-dark text-sm text-sapv-gray">
                        <tr>
                            <th className="p-4 w-1/4">Sigla</th>
                            <th className="p-4">Nome</th>
                        </tr>
                    </thead>
                    <tbody>
                        {parties.map(p => (
                            <tr key={p.id} className="border-b border-sapv-gray-dark hover:bg-sapv-blue-light/50 transition-colors">
                                <td className="p-4 font-bold">{p.acronym}</td>
                                <td className="p-4">{p.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Card>
    );
};