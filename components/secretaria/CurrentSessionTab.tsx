import React from 'react';
import { useSession } from '../../context/SessionContext';
import Card from '../common/Card';
import { VoteOption } from '../../types';
import { Calendar, Users, Vote, Mic, CheckCircle, XCircle } from 'lucide-react';

export const CurrentSessionTab: React.FC = () => {
    const { session, legislatureConfig, councilMembers } = useSession();

    const simVotes = Object.values(session.votes).filter(v => v === VoteOption.SIM).length;
    const naoVotes = Object.values(session.votes).filter(v => v === VoteOption.NAO).length;
    const absVotes = Object.values(session.votes).filter(v => v === VoteOption.ABS).length;

    // Fix: Derive present member IDs and count from the session.presence object.
    const presentMemberIds = Object.keys(session.presence).filter(id => session.presence[id]);
    const presentMembersCount = presentMemberIds.length;

    const presencePercentage = legislatureConfig.totalMembers > 0 ? (presentMembersCount / legislatureConfig.totalMembers) * 100 : 0;
    
    // Fix: Filter council members based on the derived list of present member IDs.
    const presentMembersList = councilMembers.filter(m => presentMemberIds.includes(m.uid));
    const absentMembersList = councilMembers.filter(m => !presentMemberIds.includes(m.uid));

    return (
        <div className="space-y-8">
            <Card title="Status Geral da Sessão">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div className="bg-sapv-blue-dark p-4 rounded-lg">
                        <Calendar className="mx-auto mb-2 text-sapv-highlight" />
                        <p className="text-sm text-sapv-gray">Status</p>
                        <p className={`text-2xl font-bold ${session.status === 'active' ? 'text-green-400' : 'text-red-400'}`}>
                            {session.status === 'active' ? 'ATIVA' : 'INATIVA'}
                        </p>
                    </div>
                    <div className="bg-sapv-blue-dark p-4 rounded-lg">
                        <Users className="mx-auto mb-2 text-sapv-highlight" />
                        <p className="text-sm text-sapv-gray">Presença</p>
                        <p className="text-2xl font-bold">
                            {/* Fix: Use the calculated present members count. */}
                            {presentMembersCount} / {legislatureConfig.totalMembers}
                        </p>
                         <div className="w-full bg-sapv-gray-dark rounded-full h-2.5 mt-2">
                            <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${presencePercentage}%` }}></div>
                        </div>
                    </div>
                     <div className="bg-sapv-blue-dark p-4 rounded-lg">
                        <Vote className="mx-auto mb-2 text-sapv-highlight" />
                        <p className="text-sm text-sapv-gray">Votação</p>
                        <p className={`text-2xl font-bold ${session.votingOpen ? 'text-green-400 animate-pulse' : 'text-sapv-gray'}`}>
                            {session.votingOpen ? 'ABERTA' : 'FECHADA'}
                        </p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Pauta e Votação Atual">
                     <div className="space-y-4">
                        <h3 className="font-semibold text-lg text-sapv-gray-light">{session.currentProject?.title || 'Nenhum projeto em pauta'}</h3>
                        <p className="text-sm text-sapv-gray">{session.currentProject?.description}</p>
                        {session.currentProject && (
                            <div className="border-t border-sapv-gray-dark pt-4">
                                <h4 className="font-semibold mb-2">Resultado Parcial da Votação</h4>
                                <div className="flex justify-around text-center">
                                    <div className="text-green-400">
                                        <p className="text-3xl font-bold">{simVotes}</p>
                                        <p>SIM</p>
                                    </div>
                                     <div className="text-red-400">
                                        <p className="text-3xl font-bold">{naoVotes}</p>
                                        <p>NÃO</p>
                                    </div>
                                     <div className="text-yellow-400">
                                        <p className="text-3xl font-bold">{absVotes}</p>
                                        <p>ABSTER</p>
                                    </div>
                                </div>
                                {session.votingResult && (
                                    <div className={`mt-4 p-3 rounded-lg text-center font-bold ${session.votingResult.includes('APROVADO') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                                        {session.votingResult}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card>
                <Card title="Controle da Tribuna">
                    <div className="space-y-4">
                         <div>
                            <p className="text-sm text-sapv-gray">Orador Atual</p>
                            <div className="flex items-center gap-3 bg-sapv-blue-dark p-3 rounded-md">
                                <Mic className="text-sapv-highlight"/>
                                <p className="font-bold text-lg">{session.currentSpeaker?.name || 'Ninguém na tribuna'}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-sapv-gray">Inscritos para Falar</p>
                             <ul className="space-y-2 max-h-40 overflow-y-auto mt-2 pr-2">
                                {session.speakerQueue.length > 0 ? session.speakerQueue.map((v, i) => (
                                    <li key={v.uid} className="bg-sapv-blue-dark p-2 rounded">{i + 1}º - {v.name}</li>
                                )) : (
                                    <li className="text-sapv-gray text-center py-4">Ninguém inscrito.</li>
                                )}
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
            
            <Card title="Registro de Presença">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <h3 className="font-semibold text-green-400 mb-2">Presentes ({presentMembersList.length})</h3>
                        <ul className="space-y-1 text-sm">
                            {presentMembersList.map(m => <li key={m.uid} className="flex items-center"><CheckCircle size={14} className="mr-2 text-green-500"/>{m.name}</li>)}
                        </ul>
                    </div>
                     <div>
                        <h3 className="font-semibold text-red-400 mb-2">Ausentes ({absentMembersList.length})</h3>
                        <ul className="space-y-1 text-sm">
                            {absentMembersList.map(m => <li key={m.uid} className="flex items-center"><XCircle size={14} className="mr-2 text-red-500"/>{m.name}</li>)}
                        </ul>
                    </div>
                </div>
            </Card>

        </div>
    );
};
