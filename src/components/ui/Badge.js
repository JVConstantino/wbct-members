const variantClass = {
  success: 'bg-status-success-bg text-status-success',
  warning: 'bg-status-warning-bg text-status-warning',
  error:   'bg-status-error-bg   text-status-error',
  info:    'bg-status-info-bg    text-status-info',
  pending: 'bg-status-pending-bg text-status-pending',
  neutral: 'bg-surface-subtle    text-text-secondary',
  brand:   'bg-brand-primary-light text-brand-primary-active',
};

const sizeClass = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2    py-0.5 text-xs',
  lg: 'px-2.5  py-1   text-sm',
};

// Mapeamento de status de texto para variant
export const statusToVariant = {
  APPROVED: 'success',
  ACTIVE:   'success',
  APPROVED_text: 'Aprovado',
  PENDING:  'pending',
  PENDING_text: 'Pendente',
  REJECTED: 'error',
  REJECTED_text: 'Rejeitado',
  MEMBER:   'info',
  ADMIN:    'brand',
};

export function Badge({ children, variant = 'neutral', size = 'md', dot = false, className = '' }) {
  const v = variantClass[variant] ?? variantClass.neutral;
  const s = sizeClass[size] ?? sizeClass.md;

  return (
    <span className={`badge ${v} ${s} ${className}`}>
      {dot && (
        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80 shrink-0" />
      )}
      {children}
    </span>
  );
}

/** Atalho para status de postagens */
export function PostStatusBadge({ status }) {
  const map = {
    APPROVED: { variant: 'success', label: 'Aprovado' },
    PENDING:  { variant: 'pending', label: 'Pendente' },
    REJECTED: { variant: 'error',   label: 'Rejeitado' },
  };
  const cfg = map[status] ?? { variant: 'neutral', label: status };
  return <Badge variant={cfg.variant} dot>{cfg.label}</Badge>;
}

/** Atalho para role de usuários */
export function RoleBadge({ role }) {
  const map = {
    ADMIN:  { variant: 'brand', label: 'Admin' },
    MEMBER: { variant: 'info',  label: 'Membro' },
  };
  const cfg = map[role] ?? { variant: 'neutral', label: role };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export default Badge;
