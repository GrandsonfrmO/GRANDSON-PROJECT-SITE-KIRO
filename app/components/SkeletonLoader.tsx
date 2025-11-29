interface SkeletonLoaderProps {
  variant?: 'text' | 'card' | 'product' | 'image';
  count?: number;
  className?: string;
}

export default function SkeletonLoader({ 
  variant = 'text', 
  count = 1,
  className = '' 
}: SkeletonLoaderProps) {
  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="h-4 bg-neutral-200 rounded w-full"></div>
          </div>
        );
      
      case 'image':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="aspect-square bg-neutral-200 rounded-lg"></div>
          </div>
        );
      
      case 'product':
        return (
          <div className={`animate-pulse ${className}`}>
            <div className="aspect-square bg-neutral-200 rounded-lg mb-3"></div>
            <div className="space-y-2">
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
              <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-5 bg-neutral-200 rounded w-1/3"></div>
            </div>
          </div>
        );
      
      case 'card':
        return (
          <div className={`animate-pulse bg-white rounded-lg shadow-sm p-6 ${className}`}>
            <div className="space-y-4">
              <div className="h-6 bg-neutral-200 rounded w-1/2"></div>
              <div className="h-4 bg-neutral-200 rounded w-full"></div>
              <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>{renderSkeleton()}</div>
      ))}
    </>
  );
}
