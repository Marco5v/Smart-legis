
import React from 'react';
import { Info } from 'lucide-react';

interface MessagePanelProps {
    message: string;
}

const MessagePanel: React.FC<MessagePanelProps> = ({ message }) => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center text-white p-12 bg-yellow-900/95 backdrop-blur-sm">
            <div className="bg-black/30 p-12 rounded-3xl border border-yellow-500/30 shadow-2xl max-w-5xl w-full text-center">
                <Info size={80} className="mx-auto text-yellow-400 mb-6" />
                <h1 className="text-6xl font-black tracking-wider text-yellow-400 mb-10 uppercase">Comunicado</h1>
                <p className="text-5xl text-white font-bold leading-relaxed">{message}</p>
            </div>
        </div>
    );
};

export default MessagePanel;
