import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';
import { FileText } from 'lucide-react';

/**
 * Standard table component.
 *
 * columns: Array<{ key, label, render?: (value, row) => ReactNode, className?: string }>
 * data:    Array<object>
 */
export function Table({
  columns = [],
  data = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription,
  keyField = 'id',
  className = '',
  onRowClick,
}) {
  return (
    <div className={`overflow-x-auto rounded-lg border border-border-default ${className}`}>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-surface-section border-b border-border-default">
            {columns.map(col => (
              <th
                key={col.key}
                className={`px-4 py-3 text-left text-xs font-semibold text-text-muted uppercase tracking-wide whitespace-nowrap ${col.headerClass ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-border-subtle">
                {columns.map(col => (
                  <td key={col.key} className="px-4 py-3">
                    <Skeleton variant="raw" className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                <EmptyState
                  icon={<FileText size={24} />}
                  title={emptyTitle}
                  description={emptyDescription}
                />
              </td>
            </tr>
          ) : (
            data.map(row => (
              <tr
                key={row[keyField]}
                className={`border-b border-border-subtle last:border-0 transition-colors duration-100
                  ${onRowClick ? 'cursor-pointer hover:bg-surface-subtle' : 'hover:bg-surface-section/50'}`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map(col => (
                  <td key={col.key} className={`px-4 py-3 text-text-primary ${col.className ?? ''}`}>
                    {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
