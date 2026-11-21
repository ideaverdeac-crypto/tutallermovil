'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2 } from 'lucide-react';

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
  return (
    <section className="bg-brand-neutral-50 py-12 sm:py-16 lg:py-20 border-b border-brand-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabecera de la sección */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-success/10 text-brand-success text-xs font-semibold uppercase tracking-wider mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Confianza Comprobada</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-brand-trust tracking-tight">
            Clientes que ya confían en nosotros
          </h2>
          <p className="mt-2 text-sm sm:text-base text-brand-neutral-600">
            Más de 500 servicios realizados en Caracas con garantía escrita.
          </p>
        </div>

        {/* 1. Grid de Testimonios (3 Columnas en Desktop, 1 en Mobile) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {TESTIMONIOS.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-brand-neutral-200 rounded-card p-6 shadow-card flex flex-col justify-between"
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

                {/* Comentario (2 líneas en desktop) */}
                <p className="text-sm text-brand-neutral-700 leading-relaxed line-clamp-3 mb-5">
                  &ldquo;{item.comentario}&rdquo;
                </p>
              </div>

              {/* Perfil del Cliente */}
              <div className="flex items-center gap-3 pt-4 border-t border-brand-neutral-200">
                <img
                  src={item.avatarUrl}
                  alt={item.nombre}
                  loading="lazy"
                  width={44}
                  height={44}
                  className="w-11 h-11 rounded-full object-cover border border-brand-neutral-300"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-brand-trust truncate">
                    {item.nombre}
                  </p>
                  <p className="text-xs text-brand-neutral-500 truncate">
                    {item.servicio}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 2. Grid de Trabajos Recientes (3 Columnas en Desktop, 1 en Mobile) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-brand-trust">
              Evidencias de trabajos recientes en Caracas
            </h3>
            <span className="text-xs text-brand-neutral-500 hidden sm:inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-success" />
              Fotos directas de servicio
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TRABAJOS_RECIENTES.map((trabajo) => (
              <div
                key={trabajo.id}
                className="group relative overflow-hidden rounded-card border border-brand-neutral-200 shadow-card bg-brand-neutral-100 aspect-[16/10]"
              >
                <img
                  src={trabajo.imagenUrl}
                  alt={trabajo.altText}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Overlay con descripción y zona */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-trust/85 via-brand-trust/30 to-transparent flex flex-col justify-end p-4">
                  <span className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
                    {trabajo.zona}
                  </span>
                  <p className="text-sm font-semibold text-white drop-shadow-sm">
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
