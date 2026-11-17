import type { Metadata } from 'next';
import { ClienteServicioClient } from '@/components/ClienteServicioClient';

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
    title: `Estado del Servicio #${idLimpio.slice(0, 8)} - TuTallerMóvil`,
    description: 'Seguimiento en vivo, diagnóstico certificado y verificación de mecánico en TuTallerMóvil.'
  };
}

export default async function ClienteServicioPage({ params }: PageProps) {
  const { id } = await params;
  const idDecodificado = decodeURIComponent(id);

  return <ClienteServicioClient id={idDecodificado} />;
}
