import { forwardRef } from 'react';

const variantClass = {
  default:  'bg-surface-card border border-border-default shadow-card hover:shadow-card-hover',
  elevated: 'bg-surface-elevated border border-border-default shadow-card-hover',
  subtle:   'bg-surface-subtle border border-border-subtle',
  ghost:    'bg-transparent border border-border-subtle',
};

const paddingClass = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-5 md:p-6',
};

export const Card = forwardRef(function Card(
  {
    children,
    variant = 'default',
    padding = 'md',
    hover = true,
    className = '',
    as: Tag = 'div',
    ...props
  },
  ref
) {
  const v = variantClass[variant] ?? variantClass.default;
  const p = paddingClass[padding] ?? paddingClass.md;
  const h = hover ? 'transition-shadow duration-200' : '';

  return (
    <Tag
      ref={ref}
      className={`rounded-lg ${v} ${p} ${h} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
});

export default Card;
