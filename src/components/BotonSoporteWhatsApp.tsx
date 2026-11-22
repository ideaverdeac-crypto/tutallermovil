'use client';

import React from 'react';

interface BotonSoporteWhatsAppProps {
  mensaje?: string;
  telefono?: string;
  modo?: 'fab' | 'header';
  className?: string;
}

export function WhatsAppIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.34C9.36 7.34 9.09 7.4 8.87 7.65C8.65 7.89 8.02 8.48 8.02 9.7C8.02 10.91 8.91 12.08 9.03 12.24C9.16 12.4 10.77 14.9 13.25 15.96C15.32 16.85 15.74 16.67 16.19 16.63C16.64 16.58 17.64 16.03 17.85 15.45C18.06 14.86 18.06 14.36 18 14.25C17.94 14.15 17.78 14.09 17.53 13.97C17.29 13.85 16.07 13.25 15.84 13.17C15.62 13.08 15.45 13.04 15.29 13.29C15.12 13.53 14.65 14.09 14.5 14.25C14.36 14.42 14.22 14.44 13.97 14.32C13.73 14.2 12.95 13.94 12.02 13.11C11.3 12.47 10.81 11.68 10.67 11.43C10.53 11.19 10.66 11.05 10.78 10.93C10.89 10.82 11.03 10.64 11.16 10.49C11.28 10.35 11.32 10.24 11.4 10.08C11.49 9.91 11.44 9.77 11.38 9.65C11.32 9.53 10.84 8.35 10.63 7.86C10.43 7.38 10.23 7.45 10.07 7.44C9.92 7.44 9.74 7.34 9.53 7.34Z" />
    </svg>
  );
}

export default function BotonSoporteWhatsApp({
  mensaje = 'Hola, necesito ayuda con mi servicio',
  telefono = '584142314194',
  modo = 'fab',
  className = '',
}: BotonSoporteWhatsAppProps) {
  const telefonoLimpio = telefono.replace(/\D/g, '') || '584142314194';
  const url = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(mensaje)}`;

  if (modo === 'header') {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xs transition-transform hover:scale-105 active:scale-95 ${className}`}
        title="Contactar a Soporte por WhatsApp"
      >
        <WhatsAppIcon className="w-4 h-4 text-white" />
        <span>Soporte WhatsApp</span>
      </a>
    );
  }

  // Floating Action Button (FAB)
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs shadow-2xl hover:shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95 border-2 border-white/40 backdrop-blur-sm group ${className}`}
      title="Soporte WhatsApp Oficial"
      aria-label="Soporte WhatsApp"
    >
      <div className="relative">
        <WhatsAppIcon className="w-5 h-5 text-white" />
        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white ring-2 ring-[#25D366] animate-pulse" />
      </div>
      <span className="hidden sm:inline font-bold tracking-wide">
        Soporte WhatsApp
      </span>
    </a>
  );
}
