
import React from 'react';

interface HeaderProps {
  onAddProperty: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddProperty }) => {
  return (
    <header className="h-24 px-6 md:px-10 bg-white/80 backdrop-blur-xl border-b border-gray-100 flex items-center justify-between sticky top-0 z-30 transition-all duration-300">
    </header>
  );
};
