import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal de Especialistas Aliados - TuTallerMóvil',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AliadosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
