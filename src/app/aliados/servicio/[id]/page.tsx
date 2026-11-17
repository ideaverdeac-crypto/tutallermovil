import type { Metadata } from 'next';
import { ServicioEjecucionClient } from '@/components/ServicioEjecucionClient';

export const instant = false;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const idLimpio = decodeURIComponent(id).toUpperCase();

  return {
    title: `Ejecución de Servicio #${idLimpio.slice(0, 8)} - TuTallerMóvil`,
    description: 'Consola móvil de ejecución de servicio técnico y checklist de odómetro en campo de TuTallerMóvil.'
  };
}

export default async function ServicioEjecucionPage({ params }: PageProps) {
  const { id } = await params;
  const idDecodificado = decodeURIComponent(id);

  return <ServicioEjecucionClient id={idDecodificado} />;
}
