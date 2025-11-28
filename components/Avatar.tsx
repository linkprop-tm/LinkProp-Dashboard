import React, { useState } from 'react';
import { generarIniciales, generarColorAvatar } from '../lib/api/storage';

interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'medium',
  className = '',
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
    xlarge: 'w-32 h-32 text-3xl',
  };

  const showInitials = !src || imageError;
  const iniciales = generarIniciales(name);
  const colorFondo = generarColorAvatar(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold text-white ${className}`}
      style={showInitials ? { backgroundColor: colorFondo } : undefined}
    >
      {showInitials ? (
        iniciales
      ) : (
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      )}
    </div>
  );
};
