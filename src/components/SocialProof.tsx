'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { TiltCard } from './TiltCard';

interface Testimonial {
  id: string;
  nombre: string;
  servicio: string;
  comentario: string;
  avatarUrl: string;
  calificacion: number;
}

interface TrabajoReciente {
  id: string;
  titulo: string;
  zona: string;
  imagenUrl: string;
  altText: string;
}

// TODO: Reemplazar con fotos de clientes reales recolectadas durante las órdenes
const TESTIMONIOS: Testimonial[] = [
  {
    id: 'testimonio-1',
    nombre: 'Alejandro Rivas',
    servicio: 'Diagnóstico Computarizado OBD2 — Las Mercedes',
    comentario:
      'El mecánico llegó en 35 minutos a mi oficina. Escaneó el vehículo y detectó una falla intermitente en la bobina sin rodeos.',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    calificacion: 5,
  },
  {
    id: 'testimonio-2',
    nombre: 'Mariana Delgado',
    servicio: 'Cambio de Batería a Domicilio — Altamira',
    comentario:
      'Verifiqué su carnet con el QR antes de permitir el acceso. Instaló la batería nueva, probó el alternador y me dio garantía escrita.',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    calificacion: 5,
  },
  {
    id: 'testimonio-3',
    nombre: 'Carlos Benítez',
    servicio: 'Frenos y Tren Delantero — El Cafetal',
    comentario:
      'Mantenimiento de pastillas y discos directo en mi estacionamiento. Muy ordenados con las herramientas y la garantía de 90 días es real.',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    calificacion: 5,
  },
];

// TODO: Reemplazar con fotos reales de evidencias subidas por mecánicos en servicios finalizados
const TRABAJOS_RECIENTES: TrabajoReciente[] = [
  {
    id: 'trabajo-1',
    titulo: 'Mantenimiento Preventivo de Frenos',
    zona: 'Chacao',
    imagenUrl:
      'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=700&q=80',
    altText:
      'Especialista automotriz realizando sustitución y rectificación de frenos en vehículo estacionado',
  },
  {
    id: 'trabajo-2',
    titulo: 'Diagnóstico Electrónico OBD2 en Vivo',
    zona: 'Baruta',
    imagenUrl:
      'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=700&q=80',
    altText:
      'Escaneo computarizado con equipo OBD2 en el conector de diagnóstico de un vehículo',
  },
  {
    id: 'trabajo-3',
    titulo: 'Inspección de 25 Puntos de Seguridad',
    zona: 'La Castellana',
    imagenUrl:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=80',
    altText:
      'Mecánico revisando niveles y correas del motor bajo el capó a domicilio',
  },
];

export function SocialProof() {
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const rm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setReducedMotion(rm);
      if (rm) {
        setInView(true);
        return;
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) observer.observe(sectionRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="bg-[#050B14] py-16 sm:py-20 lg:py-24 border-b border-slate-800/80 relative overflow-hidden"
    >
      {/* Resplandor sutil de fondo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#00E5FF]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Cabecera de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CCFF00]/10 text-[#CCFF00] border border-[#CCFF00]/25 text-caption font-mono uppercase tracking-wider mb-4 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#CCFF00]" />
            <span>Confianza Comprobada</span>
          </div>
          <h2 className="text-h2 font-medium text-white tracking-tight">
            Clientes que ya confían en nosotros
          </h2>
          <p className="mt-2 text-body text-slate-400">
            Más de 500 servicios realizados en Caracas con garantía escrita.
          </p>
        </div>

        {/* 1. Grid de Testimonios con Tilt 3D Sutil */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {TESTIMONIOS.map((item) => (
            <TiltCard
              key={item.id}
              maxTiltDeg={5}
              className="bg-[#0F1B2D]/90 border border-slate-800 rounded-card p-6 shadow-card flex flex-col justify-between h-full hover:border-[#CCFF00]/30 transition-colors"
            >
              <div>
                {/* 5 Estrellas */}
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(item.calificacion)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Comentario */}
                <p className="text-body text-slate-300 leading-relaxed mb-6 font-normal">
                  &ldquo;{item.comentario}&rdquo;
                </p>
              </div>

              {/* Perfil del Cliente */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <Image
                  src={item.avatarUrl}
                  alt={item.nombre}
                  loading="lazy"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover border border-slate-700"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-small font-medium text-white truncate">
                    {item.nombre}
                  </p>
                  <p className="text-caption text-slate-400 truncate">
                    {item.servicio}
                  </p>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>

        {/* 2. Grid de Trabajos Recientes con Stagger y Clip-Path */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-h3 font-medium text-white">
              Evidencias de trabajos recientes en Caracas
            </h3>
            <span className="text-caption text-slate-400 hidden sm:inline-flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              Fotos directas de servicio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRABAJOS_RECIENTES.map((trabajo, idx) => (
              <div
                key={trabajo.id}
                className="group relative overflow-hidden rounded-card border border-slate-800 bg-[#0F1B2D] aspect-[16/10] will-change-transform shadow-card hover:border-[#00E5FF]/40 transition-colors"
                style={{
                  clipPath:
                    reducedMotion || inView
                      ? 'inset(0 0 0 0)'
                      : 'inset(10% 0 10% 0)',
                  opacity: reducedMotion || inView ? 1 : 0.4,
                  transform:
                    reducedMotion || inView
                      ? 'scale(1)'
                      : 'scale(0.96)',
                  transition: `clip-path 700ms cubic-bezier(0.16, 1, 0.3, 1) ${
                    idx * 120
                  }ms, transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${
                    idx * 120
                  }ms, opacity 500ms ease-out ${idx * 120}ms`,
                }}
              >
                <Image
                  src={trabajo.imagenUrl}
                  alt={trabajo.altText}
                  loading="lazy"
                  width={700}
                  height={438}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B14]/90 via-[#050B14]/30 to-transparent flex flex-col justify-end p-4">
                  <span className="text-caption font-mono font-bold text-[#CCFF00] tracking-wider">
                    {trabajo.zona}
                  </span>
                  <p className="text-small font-semibold text-white drop-shadow-sm">
                    {trabajo.titulo}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
