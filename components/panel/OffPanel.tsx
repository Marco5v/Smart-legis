import React from 'react';
import Clock from './Clock';

const OffPanel: React.FC = React.memo(() => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white p-8 bg-black">
      <Clock className="text-9xl font-bold" />
    </div>
  );
});

export default OffPanel;
