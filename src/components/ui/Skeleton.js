function Pulse({ className = '' }) {
  return (
    <div className={`animate-pulse bg-surface-subtle rounded ${className}`} />
  );
}

export function Skeleton({ variant = 'text', lines = 3, className = '' }) {
  if (variant === 'text') {
    return (
      <div className={`space-y-2 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <Pulse key={i} className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`} />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className={`card space-y-3 ${className}`}>
        <Pulse className="h-5 w-2/3" />
        <Pulse className="h-4 w-full" />
        <Pulse className="h-4 w-5/6" />
        <div className="flex gap-2 pt-1">
          <Pulse className="h-6 w-16 rounded-full" />
          <Pulse className="h-6 w-20 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'avatar') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <Pulse className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <Pulse className="h-4 w-1/3" />
          <Pulse className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: lines }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Pulse className="h-4 w-8" />
            <Pulse className="h-4 flex-1" />
            <Pulse className="h-4 w-24" />
            <Pulse className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'stat') {
    return (
      <div className={`card space-y-2 ${className}`}>
        <Pulse className="h-3 w-1/2" />
        <Pulse className="h-8 w-1/3" />
        <Pulse className="h-3 w-2/3" />
      </div>
    );
  }

  // raw / custom
  return <Pulse className={className} />;
}

/** Spinner simples para loading inline */
export function Spinner({ size = 'sm', className = '' }) {
  const s = { xs: 'h-3 w-3', sm: 'h-4 w-4', md: 'h-5 w-5', lg: 'h-6 w-6' }[size] ?? 'h-4 w-4';
  return (
    <svg className={`animate-spin text-brand-primary ${s} ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

export default Skeleton;
