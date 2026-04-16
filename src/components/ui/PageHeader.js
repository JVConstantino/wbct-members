export function PageHeader({ title, subtitle, actions, breadcrumb, className = '' }) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 ${className}`}>
      <div className="min-w-0">
        {breadcrumb && (
          <div className="flex items-center gap-1.5 text-xs text-text-muted mb-1">
            {breadcrumb}
          </div>
        )}
        <h1 className="text-xl font-bold text-text-primary font-display truncate">{title}</h1>
        {subtitle && (
          <p className="text-sm text-text-muted mt-0.5">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}

export default PageHeader;
