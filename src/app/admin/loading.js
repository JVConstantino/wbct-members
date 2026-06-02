import { Spinner } from '@/components/ui/Skeleton';

export default function AdminLoading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <p className="text-sm text-text-muted">Loading...</p>
      </div>
    </div>
  );
}
