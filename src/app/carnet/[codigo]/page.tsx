import type { Metadata } from 'next';
import { CarnetCard } from '@/components/CarnetCard';

export const instant = false;

interface PageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { codigo } = await params;
  const codigoLimpio = decodeURIComponent(codigo).toUpperCase();
  const idFormateado = codigoLimpio.startsWith('#')
    ? codigoLimpio
    : codigoLimpio.startsWith('TTM-')
    ? `#${codigoLimpio}`
    : `#TTM-${codigoLimpio}`;

  return {
    title: `Credencial Oficial ${idFormateado} - TuTallerMóvil`,
    description: `Verificación oficial de identidad del especialista mecánico de TuTallerMóvil (${idFormateado}) en Caracas.`,
    robots: {
      index: false,
      follow: false
    }
  };
}

export default async function CarnetPage({ params }: PageProps) {
  const { codigo } = await params;
  const codigoDecodificado = decodeURIComponent(codigo);

  return <CarnetCard codigo={codigoDecodificado} />;
}
