import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSession } from '../../context/SessionContext';
import Button from './Button';
import { UserRole } from '../../types';

export const OperationalChat: React.FC = () => {
    const { user } = useAuth();
    const { session, sendOperationalChatMessage } = useSession();
    const [message, setMessage] = useState('');
    const chatEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [session.operationalChat]);
    
    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (user && message.trim()) {
            sendOperationalChatMessage({
                uid: user.uid,
                name: user.name,
                role: user.role
            }, message.trim());
            setMessage('');
        }
    };
    
    const getRoleColor = (role: UserRole) => {
        switch(role) {
            case UserRole.PRESIDENTE: return 'text-red-400';
            case UserRole.CONTROLADOR: return 'text-blue-400';
            case UserRole.SECRETARIA: return 'text-green-400';
            default: return 'text-sapv-gray';
        }
    }

    return (
        <div className="flex flex-col h-full bg-sapv-blue-dark rounded-b-lg">
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {session.operationalChat.map((chat) => {
                    const isMe = chat.user.uid === user?.uid;
                    return (
                        <div key={chat.timestamp} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`rounded-lg px-3 py-2 max-w-xs ${isMe ? 'bg-blue-800' : 'bg-sapv-gray-dark'}`}>
                                {!isMe && (
                                    <p className={`text-xs font-bold ${getRoleColor(chat.user.role)}`}>
                                        {chat.user.name.split(' ')[0]}
                                    </p>
                                )}
                                <p className="text-sm text-sapv-gray-light">{chat.message}</p>
                            </div>
                            <span className="text-xs text-sapv-gray mt-1">
                                {new Date(chat.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSend} className="p-3 border-t border-sapv-gray-dark flex gap-2">
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Digite aqui..."
                    className="flex-grow w-full px-3 py-2 text-sm bg-sapv-blue-light border border-sapv-gray-dark rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button type="submit" size="sm" disabled={!message.trim()}>
                    <Send size={16} />
                </Button>
            </form>
        </div>
    );
};
