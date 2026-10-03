import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', variant = 'rect' }) => {
  const baseStyle = 'animate-pulse bg-zinc-200';
  
  const variants = {
    text: 'h-3.5 w-3/4 rounded',
    rect: 'rounded-lg',
    circle: 'rounded-full h-12 w-12',
  };

  return (
    <div 
      className={`${baseStyle} ${variants[variant]} ${className}`} 
      aria-hidden="true" 
    />
  );
};

export default Skeleton;
