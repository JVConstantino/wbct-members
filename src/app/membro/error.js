'use client';
import { useEffect } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

export default function MembroError({ error, reset }) {
  useEffect(() => {
    console.error('[Membro] Erro capturado:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="w-16 h-16 rounded-xl bg-status-error-bg flex items-center justify-center mb-4">
        <AlertTriangle size={28} className="text-status-error" />
      </div>
      <h2 className="text-lg font-bold text-text-primary font-display mb-2">
        Algo deu errado
      </h2>
      <p className="text-sm text-text-muted max-w-sm mb-6">
        {error?.message || 'Ocorreu um erro inesperado nesta página.'}
      </p>
      <button onClick={reset} className="btn-primary gap-2">
        <RotateCcw size={15} />
        Tentar novamente
      </button>
    </div>
  );
}
