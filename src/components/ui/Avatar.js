const sizeClass = {
  xs:  'w-6  h-6  text-[10px]',
  sm:  'w-8  h-8  text-xs',
  md:  'w-10 h-10 text-sm',
  lg:  'w-12 h-12 text-base',
  xl:  'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
};

const dotSizeClass = {
  xs:  'w-1.5 h-1.5 ring-1',
  sm:  'w-2   h-2   ring-1',
  md:  'w-2.5 h-2.5 ring-2',
  lg:  'w-3   h-3   ring-2',
  xl:  'w-3.5 h-3.5 ring-2',
  '2xl': 'w-4  h-4   ring-2',
};

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('');
}

export function Avatar({ src, name = '', size = 'md', online, className = '' }) {
  const sz  = sizeClass[size]    ?? sizeClass.md;
  const dsz = dotSizeClass[size] ?? dotSizeClass.md;
  const initials = getInitials(name);
  const hasImage = typeof src === 'string' && src.trim().length > 0;

  return (
    <span className={`relative inline-flex shrink-0 ${className}`}>
      {hasImage ? (
        <img
          src={src}
          alt={name || 'Avatar'}
          className={`${sz} rounded-full object-cover bg-surface-subtle`}
          onError={e => { e.currentTarget.style.display = 'none'; }}
        />
      ) : null}
      <span
        className={`${sz} rounded-full bg-brand-primary-light text-brand-primary-active font-semibold flex items-center justify-center select-none ${hasImage ? 'hidden' : ''}`}
        aria-hidden={hasImage}
      >
        {initials || '?'}
      </span>

      {online !== undefined && (
        <span
          className={`absolute bottom-0 right-0 ${dsz} rounded-full ring-surface-card ${online ? 'bg-status-success' : 'bg-text-muted'}`}
          aria-label={online ? 'Online' : 'Offline'}
        />
      )}
    </span>
  );
}

export default Avatar;
