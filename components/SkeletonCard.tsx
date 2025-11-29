import React from 'react';

interface SkeletonCardProps {
  variant?: 'grid' | 'list' | 'compact';
  className?: string;
}

export const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'grid', className = '' }) => {
  if (variant === 'list') {
    return (
      <div className={`bg-white p-3 rounded-2xl border border-gray-100 flex items-center gap-6 animate-pulse ${className}`}>
        <div className="w-24 h-20 bg-gray-200 rounded-xl flex-shrink-0"></div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="flex gap-2">
            <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
            <div className="h-8 w-16 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
          <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`bg-gray-50/50 p-3 rounded-xl border border-transparent animate-pulse ${className}`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden animate-pulse ${className}`}>
      <div className="aspect-video bg-gray-200"></div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gray-200 rounded-full"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-32"></div>
              <div className="h-3 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="h-6 bg-gray-200 rounded w-20"></div>
            <div className="h-6 bg-gray-200 rounded w-20"></div>
          </div>
        </div>
        <div className="h-px bg-gray-100"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-4/5"></div>
          <div className="flex gap-2 pt-2">
            <div className="h-8 bg-gray-200 rounded-md flex-1"></div>
            <div className="h-8 bg-gray-200 rounded-md flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SkeletonTableProps {
  rows?: number;
  className?: string;
}

export const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 5, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, index) => (
        <div
          key={index}
          className="bg-white p-4 rounded-xl border border-gray-100 animate-pulse"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="flex gap-2">
              <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
              <div className="h-8 w-20 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

interface SkeletonGridProps {
  items?: number;
  variant?: 'property' | 'client';
  className?: string;
}

export const SkeletonGrid: React.FC<SkeletonGridProps> = ({ items = 6, variant = 'property', className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <SkeletonCard
          key={index}
          variant={variant === 'property' ? 'grid' : 'grid'}
          style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
        />
      ))}
    </div>
  );
};
