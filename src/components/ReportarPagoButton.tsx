'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { activarSuscripcion } from '@/app/actions/suscripcion';

interface ReportarPagoButtonProps {
  vehiculoId?: string;
  placa?: string;
}

export function ReportarPagoButton({ vehiculoId, placa }: ReportarPagoButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActivated, setIsActivated] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleActivar = () => {
    setErrorMessage(null);

    startTransition(async () => {
      const result = await activarSuscripcion({ vehiculoId, placa });

      if (result.success) {
        setIsActivated(true);
        // Recargar los datos del servidor para que se actualice la vista y se desbloquee el historial
        router.refresh();
      } else {
        setErrorMessage(result.error || 'No se pudo activar la suscripción');
      }
    });
  };

  return (
    <div className="w-full space-y-2">
      <button
        type="button"
        disabled={isPending || isActivated}
        onClick={handleActivar}
        className={`w-full h-14 text-base sm:text-lg font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 border border-[#0A1525]/10 ${
          isActivated
            ? 'bg-emerald-600 text-white cursor-default'
            : isPending
            ? 'bg-[#CCFF00]/80 text-[#0A1525] opacity-90 cursor-wait'
            : 'bg-[#CCFF00] hover:bg-[#b8e600] active:scale-[0.98] text-[#0A1525] hover:shadow-lg cursor-pointer'
        }`}
      >
        {isPending ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin text-[#0A1525]" />
            <span>Procesando activación...</span>
          </>
        ) : isActivated ? (
          <>
            <CheckCircle2 className="w-5 h-5 text-white" />
            <span>¡Suscripción Activada!</span>
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5 text-[#0A1525]" />
            <span>Reportar Pago y Obtener Clave</span>
          </>
        )}
      </button>

      {errorMessage && (
        <p className="text-xs text-red-600 font-medium text-center">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
