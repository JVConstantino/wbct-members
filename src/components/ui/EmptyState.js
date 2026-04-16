export function EmptyState({
  icon,
  title = 'Nenhum item encontrado',
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="w-14 h-14 rounded-xl bg-surface-subtle flex items-center justify-center mb-4 text-text-muted">
          {icon}
        </div>
      )}
      <p className="text-sm font-semibold text-text-primary mb-1">{title}</p>
      {description && (
        <p className="text-sm text-text-muted max-w-xs">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;
