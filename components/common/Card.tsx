
import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', title }) => {
  return (
    <div className={`bg-sapv-blue-light border border-sapv-gray-dark rounded-lg shadow-lg p-6 ${className}`}>
      {title && <h2 className="text-xl font-bold text-sapv-gray-light mb-4 border-b border-sapv-gray-dark pb-2">{title}</h2>}
      {children}
    </div>
  );
};

export default Card;
