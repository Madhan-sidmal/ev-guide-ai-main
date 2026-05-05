import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  variant?: 'card' | 'text' | 'circle' | 'map';
  className?: string;
}

export const SkeletonLoader = ({ variant = 'card', className = '' }: SkeletonLoaderProps) => {
  if (variant === 'map') {
    return (
      <div className={`rounded-2xl bg-muted animate-pulse aspect-video ${className}`} />
    );
  }
  if (variant === 'circle') {
    return <div className={`rounded-full bg-muted animate-pulse w-12 h-12 ${className}`} />;
  }
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
        <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
      </div>
    );
  }
  return (
    <div className={`card-elevated p-6 space-y-4 ${className}`}>
      <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
      <div className="h-8 bg-muted animate-pulse rounded w-full" />
      <div className="h-4 bg-muted animate-pulse rounded w-1/2" />
    </div>
  );
};

export const PageLoader = () => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center bg-background"
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted" />
        <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin" />
      </div>
      <p className="text-muted-foreground text-sm font-medium">Loading...</p>
    </div>
  </motion.div>
);

export const EmptyState = ({ title, description, icon }: { title: string; description: string; icon?: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-16 text-center"
  >
    {icon && <div className="mb-4 text-muted-foreground">{icon}</div>}
    <h3 className="text-lg font-semibold font-display mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm max-w-sm">{description}</p>
  </motion.div>
);
