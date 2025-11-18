import React from 'react';
import { LogOut, BarChart3, Users, Vote, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { VoteOption } from '../types';

const AnalyticsDashboard: React.FC = () => {
    const { user, logout } = useAuth();
    const { sessionHistory, councilMembers, projects } = useSession();

    // 1. Frequência
    const attendanceData = councilMembers.map(member => {
        const sessionsAttended = sessionHistory.reduce((count, session) => {
            return session.finalPresence.includes(member.uid) ? count + 1 : count;
        }, 0);
        const totalSessions = sessionHistory.length;
        return {
            name: member.name,
            Presença: totalSessions > 0 ? (sessionsAttended / totalSessions) * 100 : 0,
            Ausência: totalSessions > 0 ? ((totalSessions - sessionsAttended) / totalSessions) * 100 : 0,
        };
    });
    
    // 2. Produtividade Legislativa
    const productivityData = councilMembers.map(member => ({
        name: member.name,
        Projetos: projects.filter(p => p.author.uid === member.uid).length
    })).filter(d => d.Projetos > 0);

    // 3. Mapa de Votações (Alinhamento)
    const voteAlignmentData = () => {
        const alignmentMatrix: { [key: string]: { [key: string]: number } } = {};
        const votesBySession = sessionHistory.flatMap(s => s.votingRecords.map(vr => vr.votes));

        if (votesBySession.length === 0) return [];
        
        councilMembers.forEach(m1 => {
            alignmentMatrix[m1.uid] = {};
            councilMembers.forEach(m2 => {
                if (m1.uid === m2.uid) return;
                let sameVotes = 0;
                let totalVotes = 0;
                votesBySession.forEach(voteRecord => {
                    const vote1 = voteRecord[m1.uid];
                    const vote2 = voteRecord[m2.uid];
                    if (vote1 && vote2 && vote1 !== VoteOption.ABS && vote2 !== VoteOption.ABS) {
                        totalVotes++;
                        if (vote1 === vote2) {
                            sameVotes++;
                        }
                    }
                });
                alignmentMatrix[m1.uid][m2.uid] = totalVotes > 0 ? (sameVotes / totalVotes) * 100 : 0;
            });
        });
        
        // Find top 5 alignments
        const alignments: { members: string, value: number }[] = [];
        Object.keys(alignmentMatrix).forEach(uid1 => {
             Object.keys(alignmentMatrix[uid1]).forEach(uid2 => {
                // Avoid duplicates
                if (uid1 < uid2) {
                    const member1 = councilMembers.find(m => m.uid === uid1)?.name || '';
                    const member2 = councilMembers.find(m => m.uid === uid2)?.name || '';
                    alignments.push({
                        members: `${member1.split(' ')[0]} & ${member2.split(' ')[0]}`,
                        value: alignmentMatrix[uid1][uid2],
                    });
                }
            });
        });
        return alignments.sort((a,b) => b.value - a.value).slice(0, 10);
    };
    
    const alignmentData = voteAlignmentData();
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF'];

    return (
        <div className="min-h-screen bg-sapv-blue-dark text-sapv-gray-light p-8">
            <header className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Análise e Relatórios</h1>
                    <p className="text-sapv-gray">Usuário: {user?.name}</p>
                </div>
                <Button onClick={logout} variant="danger">
                    <LogOut className="inline-block mr-2" size={16} /> Sair
                </Button>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Frequência dos Vereadores (%)" className="lg:col-span-2">
                     <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={attendanceData} layout="vertical" margin={{ top: 5, right: 30, left: 80, bottom: 5 }}>
                            <XAxis type="number" stroke="#8892b0" domain={[0, 100]}/>
                            <YAxis type="category" dataKey="name" stroke="#8892b0" width={120} />
                            <Tooltip contentStyle={{ backgroundColor: '#0a192f', border: '1px solid #495670' }}/>
                            <Legend wrapperStyle={{ color: '#ccd6f6' }}/>
                            <Bar dataKey="Presença" stackId="a" fill="#16a34a" />
                            <Bar dataKey="Ausência" stackId="a" fill="#dc2626" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                
                 <Card title="Produtividade Legislativa (Projetos Apresentados)">
                     <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={productivityData} dataKey="Projetos" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {productivityData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#0a192f', border: '1px solid #495670' }}/>
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                <Card title="Mapa de Votação (Top 10 Alinhamentos %)">
                     <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={alignmentData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                           <XAxis type="number" stroke="#8892b0" domain={[0, 100]}/>
                            <YAxis type="category" dataKey="members" stroke="#8892b0" />
                            <Tooltip contentStyle={{ backgroundColor: '#0a192f', border: '1px solid #495670' }}/>
                             <Bar dataKey="value" name="Alinhamento" fill="#64ffda" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default AnalyticsDashboard;
