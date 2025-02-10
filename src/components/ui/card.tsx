import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`card bg-dark text-white border-0 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
