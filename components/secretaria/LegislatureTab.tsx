import React from 'react';
import Card from '../common/Card';
import { useSession } from '../../context/SessionContext';
import { Users, Scale, Calendar } from 'lucide-react';

export const LegislatureTab: React.FC = () => {
    const { legislatureConfig } = useSession();

    const infoItems = [
        { icon: <Users className="text-sapv-highlight"/>, label: "Total de Vereadores", value: legislatureConfig.totalMembers },
        { icon: <Scale className="text-sapv-highlight"/>, label: "Quórum para Abertura", value: legislatureConfig.quorumToOpen },
        { icon: <Calendar className="text-sapv-highlight"/>, label: "Início da Legislatura", value: new Date(legislatureConfig.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) },
        { icon: <Calendar className="text-sapv-highlight"/>, label: "Fim da Legislatura", value: new Date(legislatureConfig.endDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) },
    ];
    
    return (
        <Card title="Configurações da Legislatura">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {infoItems.map(item => (
                    <div key={item.label} className="bg-sapv-blue-dark p-6 rounded-lg flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-sapv-blue-light rounded-full flex items-center justify-center">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-sm text-sapv-gray">{item.label}</p>
                            <p className="text-2xl font-bold text-sapv-gray-light">{item.value}</p>
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};