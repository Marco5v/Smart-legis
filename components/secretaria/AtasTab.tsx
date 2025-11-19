
import React, { useState } from 'react';
import Card from '../common/Card';
import Button from '../common/Button';
import { useSession } from '../../context/SessionContext';
import { SessionHistory } from '../../types';
import { BookCheck, FileText, Save } from 'lucide-react';

export const AtasTab: React.FC = () => {
    const { sessionHistory, publishedAtas, publishAta, saveAtaDraft } = useSession();
    const [selectedSession, setSelectedSession] = useState<SessionHistory | null>(null);
    const [ataContent, setAtaContent] = useState('');
    const [error, setError] = useState('');
    const [feedback, setFeedback] = useState('');

    const handleSelectSession = (session: SessionHistory) => {
        setSelectedSession(session);
        setFeedback(''); // Clear feedback on new selection
        setError('');
        
        if (session.ataDraftContent) {
            setAtaContent(session.ataDraftContent);
        } else {
            const rawReport = `
ATA DA SESSÃO ORDINÁRIA DE ${new Date(session.date).toLocaleDateString('pt-BR')}

PRESENTES: ${session.finalPresence.length} vereadores.

VOTAÇÕES REALIZADAS:
${session.votingRecords.map(r => ` - ${r.projectTitle}: ${r.result}`).join('\n')}

--- Fim do Relatório Bruto ---
            `.trim();
            setAtaContent(rawReport);
        }
    }

    const handleSaveDraft = () => {
        if (selectedSession && ataContent) {
            saveAtaDraft(selectedSession.sessionId, ataContent);
            setFeedback('Rascunho salvo com sucesso!');
            setTimeout(() => setFeedback(''), 3000);
        }
    }
    
    const handlePublish = () => {
        if (!ataContent.trim()) {
            setError('O conteúdo da ata não pode estar vazio.');
            return;
        }
        if (ataContent.trim().length < 20) {
            setError('O conteúdo da ata é muito curto.');
            return;
        }

        if(selectedSession) {
            if (window.confirm("Tem certeza que deseja publicar esta ata no portal? Esta ação não pode ser desfeita.")) {
                publishAta({
                    sessionId: selectedSession.sessionId,
                    date: new Date().toISOString(),
                    title: `Ata da Sessão de ${new Date(selectedSession.date).toLocaleDateString('pt-BR')}`,
                    content: ataContent,
                });
                
                setFeedback('Ata publicada com sucesso no portal!');
                setTimeout(() => setFeedback(''), 4000);

                setSelectedSession(null);
                setAtaContent('');
                setError('');
            }
        }
    }
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAtaContent(e.target.value);
        if (error) {
            setError('');
        }
    }

    const handleGenerateAgenda = (session: SessionHistory) => {
        const pautaWindow = window.open('', '_blank');
        if (pautaWindow) {
            pautaWindow.document.write(`
                <html>
                    <head>
                        <title>Pauta da Sessão - ${new Date(session.date).toLocaleDateString('pt-BR')}</title>
                        <style>
                            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; margin: 2rem; color: #333; }
                            .container { max-width: 800px; margin: auto; }
                            h1, h2, h3 { text-align: center; }
                            h1 { font-size: 1.5rem; }
                            h2 { font-size: 1.2rem; color: #555; margin-bottom: 0.5rem; }
                            h3 { font-size: 1.1rem; font-weight: normal; margin-top: 0; margin-bottom: 2rem; }
                            ul { list-style-type: none; padding: 0; }
                            li { background-color: #f4f4f4; padding: 0.8rem 1.2rem; border-left: 4px solid #007bff; margin-bottom: 0.5rem; }
                            li strong { font-size: 1.1em; }
                            .header-img { display: block; margin: 0 auto 1rem; height: 80px; }
                            @media print {
                                body { margin: 1in; color: #000; }
                                .no-print { display: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <img src="https://picsum.photos/seed/brasao/80" alt="Brasão" class="header-img" />
                            <h1>Câmara Municipal de Exemplo</h1>
                            <h2>Pauta da Sessão Ordinária</h2>
                            <h3>Data: ${new Date(session.date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            
                            <h4>Ordem do Dia:</h4>
                            <ul>
                                ${session.votingRecords.length > 0 ? session.votingRecords.map(record => `<li><strong>${record.projectTitle}</strong><br/><small>Resultado: ${record.result}</small></li>`).join('') : '<li>Nenhum projeto votado nesta sessão.</li>'}
                            </ul>
                            <br/>
                            <div class="no-print" style="text-align: center;">
                                <button onclick="window.print()">Imprimir / Salvar como PDF</button>
                            </div>
                        </div>
                    </body>
                </html>
            `);
            pautaWindow.document.close();
            pautaWindow.focus();
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1 space-y-4">
                <Card title="Sessões Encerradas">
                    <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {sessionHistory.map(s => (
                             <div key={s.sessionId} className={`p-3 rounded-md ${selectedSession?.sessionId === s.sessionId ? 'bg-blue-800' : 'bg-sapv-blue-dark'}`}>
                                <p className="font-bold">Sessão de {new Date(s.date).toLocaleDateString('pt-BR')}</p>
                                <p className="text-xs text-sapv-gray mb-2">{s.votingRecords.length} votações</p>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="secondary" className="text-xs flex-1" onClick={() => handleSelectSession(s)}>
                                        <BookCheck size={14} className="mr-1"/> Editar Ata
                                    </Button>
                                    <Button size="sm" variant="secondary" className="text-xs flex-1" onClick={() => handleGenerateAgenda(s)}>
                                         <FileText size={14} className="mr-1"/> Gerar Pauta
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card title="Atas Publicadas">
                     <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                        {publishedAtas.map(a => (
                            <div key={a.id} className="p-3 bg-sapv-blue-dark rounded-md">
                               <p className="font-bold">{a.title}</p>
                               <p className="text-xs text-sapv-gray">Publicada em {new Date(a.date).toLocaleDateString('pt-BR')}</p>
                            </div>
                        ))}
                         {publishedAtas.length === 0 && <p className="text-sapv-gray text-center">Nenhuma ata publicada.</p>}
                     </div>
                </Card>
            </div>
            <div className="md:col-span-2">
                <Card title="Editor de Ata da Sessão">
                    {selectedSession ? (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-sapv-highlight">Editando Ata: Sessão de {new Date(selectedSession.date).toLocaleDateString('pt-BR')}</h3>
                            <p className="text-sm text-sapv-gray">Use o campo abaixo para formatar o texto oficial da ata. Salve o rascunho e, quando estiver pronto, publique no portal.</p>
                            {feedback && <p className="text-green-300 text-sm p-3 bg-green-900/50 rounded-md">{feedback}</p>}
                            <textarea 
                                value={ataContent}
                                onChange={handleContentChange}
                                rows={20}
                                className={`w-full p-3 font-mono text-sm text-sapv-gray-light bg-sapv-blue-dark border rounded-md focus:ring-blue-500 focus:border-blue-500 ${error ? 'border-red-500' : 'border-sapv-gray-dark'}`}
                            />
                            {error && <p className="text-red-400 text-xs -mt-2 mb-2">{error}</p>}
                            <div className="flex flex-col md:flex-row gap-4 pt-2 border-t border-sapv-gray-dark">
                                <Button onClick={handleSaveDraft} className="flex-1" variant="secondary">
                                    <Save size={18} className="mr-2" /> Salvar Rascunho
                                </Button>
                                <Button onClick={handlePublish} className="flex-1" variant="success">
                                    <BookCheck size={18} className="mr-2" /> Publicar Ata no Portal
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-20">
                            <p className="text-sapv-gray">Selecione uma sessão encerrada na lista ao lado para gerar e editar a ata.</p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
