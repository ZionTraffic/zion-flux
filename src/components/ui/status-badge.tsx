import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'teal' | 'orange' | 'purple' | 'cyan';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatusBadge({ 
  children, 
  variant = 'info', 
  size = 'md',
  className 
}: StatusBadgeProps) {
  const variants = {
    success: 'bg-accent/10 text-accent border-accent/20',
    warning: 'bg-orange/10 text-orange border-orange/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    info: 'bg-primary/10 text-primary border-primary/20',
    teal: 'bg-teal/10 text-teal border-teal/20',
    orange: 'bg-orange/10 text-orange border-orange/20',
    purple: 'bg-purple/10 text-purple border-purple/20',
    cyan: 'bg-cyan/10 text-cyan border-cyan/20',
  };

  const sizes = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        'transition-all duration-200',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
