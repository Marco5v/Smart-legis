import React, { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';
import { BookOpen, Users, FileText, Calendar, Vote, CheckSquare, BarChart2, Newspaper, FileBadge, MessageSquare, Shield, Mail, Youtube, Sun, Moon, ZoomIn, ZoomOut, Briefcase, History } from 'lucide-react';

const AccessibilityControls: React.FC = () => {
    const [isHighContrast, setIsHighContrast] = useState(false);
    const [fontSize, setFontSize] = useState(16);

    useEffect(() => {
        document.body.classList.toggle('high-contrast', isHighContrast);
        document.documentElement.style.fontSize = `${fontSize}px`;
    }, [isHighContrast, fontSize]);
    
    const toggleContrast = () => setIsHighContrast(prev => !prev);
    const increaseFont = () => setFontSize(prev => Math.min(prev + 2, 24));
    const decreaseFont = () => setFontSize(prev => Math.max(prev - 2, 12));

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            <button onClick={toggleContrast} className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors" aria-label="Alternar Contraste">
                {isHighContrast ? <Sun size={20} /> : <Moon size={20} />}
            </button>
             <button onClick={increaseFont} className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors" aria-label="Aumentar Fonte">
                <ZoomIn size={20} />
            </button>
             <button onClick={decreaseFont} className="p-3 bg-gray-800 text-white rounded-full shadow-lg hover:bg-gray-700 transition-colors" aria-label="Diminuir Fonte">
                <ZoomOut size={20} />
            </button>
        </div>
    )
}

const PortalPublico: React.FC = () => {
    const { sessionHistory, publishedAtas, projects } = useSession();
    const [expandedHistoryProjectId, setExpandedHistoryProjectId] = useState<string | null>(null);

    const menuItems = [
        { icon: <Youtube size={32} />, label: 'Sessão Ao Vivo' },
        { icon: <Users size={32} />, label: 'Vereadores' },
        { icon: <FileText size={32} />, label: 'Proposituras' },
        { icon: <Briefcase size={32} />, label: 'Comissões' },
        { icon: <Calendar size={32} />, label: 'Pautas' },
        { icon: <BarChart2 size={32} />, label: 'Sessões' },
        { icon: <Vote size={32} />, label: 'Votações' },
        { icon: <CheckSquare size={32} />, label: 'Lista de Frequência' },
        { icon: <FileBadge size={32} />, label: 'Atas' },
        { icon: <Newspaper size={32} />, label: 'Notícias' },
        { icon: <BookOpen size={32} />, label: 'Biblioteca de Leis' },
        { icon: <BookOpen size={32} />, label: 'Diário Oficial' },
        { icon: <Mail size={32} />, label: 'Fale Conosco' },
        { icon: <Shield size={32} />, label: 'Ouvidoria' },
    ];

    const DashboardIcon: React.FC<{ item: { icon: React.ReactNode, label: string } }> = ({ item }) => (
        <div className="flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center text-gray-700">
            <div className="text-blue-600 mb-2">{item.icon}</div>
            <span className="font-semibold text-sm">{item.label}</span>
        </div>
    );
    
    const TransmittalHistory: React.FC<{ project: typeof projects[0] }> = ({ project }) => (
        <div className="mt-4 p-4 bg-gray-100 rounded-md border-l-4 border-blue-500">
            <h4 className="font-semibold text-gray-800 mb-2">Histórico de Tramitação</h4>
            <ul className="space-y-2">
                {project.transmittalHistory?.map((entry, index) => (
                    <li key={index} className="text-sm">
                        <span className="font-mono text-gray-500 mr-2">{new Date(entry.date).toLocaleString('pt-BR')}</span>
                        <span className="font-semibold text-gray-600">[{entry.author}]</span>
                        <span className="text-gray-700 ml-1">{entry.event}</span>
                    </li>
                ))}
            </ul>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800 font-sans">
            <AccessibilityControls />
            <style>{`
                .high-contrast {
                    background-color: #000 !important;
                    color: #fff !important;
                }
                .high-contrast div, .high-contrast header, .high-contrast section, .high-contrast h1, .high-contrast h2, .high-contrast p, .high-contrast button {
                    background-color: #000 !important;
                    color: #fff !important;
                    border-color: #fff !important;
                }
                 .high-contrast a {
                    color: #FFFF00 !important;
                }
            `}</style>
            
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center">
                         <img src="https://picsum.photos/seed/brasao/50" alt="Brasão" className="h-12 mr-4" />
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">Portal da Transparência</h1>
                            <p className="text-sm text-gray-500">Câmara Municipal de Exemplo</p>
                        </div>
                    </div>
                     <button className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors">
                        Login
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <section className="mb-12">
                     <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-4 sm:gap-6">
                        {menuItems.map((item, index) => (
                            <DashboardIcon key={index} item={item} />
                        ))}
                    </div>
                </section>
                
                <section id="proposituras" className="mb-12 scroll-mt-20">
                    <h2 className="text-2xl font-bold mb-4">Proposituras e Projetos</h2>
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                        {projects.map(p => (
                            <div key={p.id} className="border-b pb-4 last:border-b-0">
                                <h3 className="font-bold text-lg">{p.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">Autor: {p.author.name} | Status: <span className="font-semibold">{p.workflowStatus}</span></p>
                                <p className="text-gray-700">{p.description}</p>
                                <button onClick={() => setExpandedHistoryProjectId(prev => prev === p.id ? null : p.id)} className="text-sm text-blue-600 hover:underline mt-2 flex items-center">
                                    <History size={16} className="mr-1"/>
                                    {expandedHistoryProjectId === p.id ? 'Ocultar Histórico' : 'Ver Histórico de Tramitação'}
                                </button>
                                {expandedHistoryProjectId === p.id && <TransmittalHistory project={p} />}
                            </div>
                        ))}
                    </div>
                </section>
                
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4 flex items-center"><Youtube className="mr-3 text-red-600"/>Sessão Ao Vivo</h2>
                    <div className="bg-white rounded-lg shadow-md p-2 aspect-video">
                        <iframe 
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=1" 
                            title="YouTube video player" 
                            frameBorder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                            allowFullScreen>
                        </iframe>
                    </div>
                </section>
                
                <section className="mb-12">
                    <h2 className="text-2xl font-bold mb-4">Atas das Sessões</h2>
                     <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                        {publishedAtas.length > 0 ? publishedAtas.map(ata => (
                            <div key={ata.id} className="border-b pb-4 last:border-b-0">
                                <h3 className="font-bold text-lg">{ata.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">Publicada em {new Date(ata.date).toLocaleDateString('pt-BR')}</p>
                                <a href="#" className="text-blue-600 hover:underline">Ver documento completo</a>
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-8">Nenhuma ata publicada ainda.</p>
                        )}
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-bold mb-4">Histórico de Votações Recentes</h2>
                    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
                        {sessionHistory.length > 0 ? sessionHistory.map(session => (
                            <div key={session.sessionId} className="border-b pb-4 last:border-b-0">
                                <h3 className="font-bold text-lg">Sessão de {new Date(session.date).toLocaleDateString('pt-BR')}</h3>
                                <p className="text-sm text-gray-500 mb-2">Presença: {session.finalPresence.length} vereadores</p>
                                {session.votingRecords.map((record, idx) => (
                                     <div key={idx} className="p-3 bg-gray-50 rounded-md">
                                        <p className="font-semibold">{record.projectTitle}</p>
                                        <p className={`font-bold ${record.result.includes('APROVADO') ? 'text-green-600' : 'text-red-600'}`}>
                                            {record.result}
                                        </p>
                                     </div>
                                ))}
                            </div>
                        )) : (
                            <p className="text-center text-gray-500 py-8">Nenhum histórico de sessão encontrado.</p>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default PortalPublico;