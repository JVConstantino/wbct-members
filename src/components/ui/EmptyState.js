import { cloneElement, createElement, isValidElement } from 'react';

export function EmptyState({
  icon,
  title = 'No items found',
  description,
  action,
  className = '',
}) {
  const isElement = isValidElement(icon);
  const isComponentType = !isElement && (typeof icon === 'function' || (typeof icon === 'object' && icon && icon.$$typeof));
  const iconContent = isElement
    ? cloneElement(icon, { size: icon.props?.size || 20 })
    : (isComponentType ? createElement(icon, { size: 20 }) : null);

  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}>
      {icon && (
        <div className="w-14 h-14 rounded-xl bg-surface-subtle flex items-center justify-center mb-4 text-text-muted">
          {iconContent}
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
