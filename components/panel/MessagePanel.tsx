
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import PresencePanel from './PresencePanel';

interface MessagePanelProps {
    message: string | null;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ message }) => {
    if (!message) {
        return <PresencePanel />;
    }

    return (
        <div className="h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white font-sans flex flex-col items-center justify-center p-8 text-center">
            <div className="bg-gray-800/50 backdrop-blur-md p-12 rounded-xl border border-yellow-500 shadow-2xl max-w-4xl w-full">
                 <div className="flex items-center justify-center gap-4 mb-6">
                    <AlertTriangle size={40} className="text-yellow-400"/>
                    <h2 className="text-3xl font-bold uppercase tracking-widest text-yellow-400">Aviso da Mesa Diretora</h2>
                </div>
                <p className="text-5xl font-bold text-white leading-tight">{message}</p>
            </div>
        </div>
    );
};

export default MessagePanel;
