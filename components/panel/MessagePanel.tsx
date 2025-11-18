import React from 'react';

interface MessagePanelProps {
  message: string | null;
}

const MessagePanel: React.FC<MessagePanelProps> = React.memo(({ message }) => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-12 bg-yellow-900 bg-opacity-80">
      <h1 className="text-6xl font-extrabold tracking-wider text-center text-yellow-300">
        AVISO
      </h1>
      <p className="mt-8 text-4xl text-center text-white">
        {message || '...'}
      </p>
    </div>
  );
});

export default MessagePanel;
