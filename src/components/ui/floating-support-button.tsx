'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@/components/ui/tooltip';

interface FloatingSupportButtonProps {
  className?: string;
  mensajePersonalizado?: string;
}

export default function FloatingSupportButton({
  className = '',
  mensajePersonalizado
}: FloatingSupportButtonProps) {
  const mensajeDefault =
    mensajePersonalizado ||
    'Hola, necesito soporte técnico con la plataforma TuTallerMóvil.';

  const handleAbrirWhatsApp = () => {
    const url = `https://wa.me/584120000000?text=${encodeURIComponent(mensajeDefault)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 ${className}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            whileHover={{ scale: 1.08, y: -2 }}
            whileTap={{ scale: 0.94 }}
            type="button"
            onClick={handleAbrirWhatsApp}
            aria-label="Contactar a Soporte Técnico por WhatsApp"
            className="group relative flex items-center gap-2 h-12 px-3.5 sm:px-4 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl hover:shadow-2xl border-2 border-white/80 transition-all cursor-pointer backdrop-blur-xs"
          >
            {/* Ping indicator */}
            <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>

            <MessageCircle className="w-5 h-5 fill-white text-[#25D366] shrink-0" />
            <span className="text-xs font-black tracking-wide pr-1 hidden sm:inline-block">
              Soporte TTM
            </span>
          </motion.button>
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-[#0A1525] text-white font-medium">
          <p className="font-bold text-emerald-400">¿Necesitas ayuda inmediata?</p>
          <p className="text-[11px] text-slate-300">
            Chatea directo con el equipo técnico de TuTallerMóvil por WhatsApp.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}
