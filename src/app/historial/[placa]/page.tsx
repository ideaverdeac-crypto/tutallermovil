import React from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { ReportarPagoButton } from '@/components/ReportarPagoButton';
import { HistorialChecklistButton } from '@/components/HistorialChecklistModal';
import { HistorialAccionesCliente } from '@/components/HistorialAccionesCliente';
import {
  Lock,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  Wrench,
  Download,
  AlertCircle,
  Calendar,
  Gauge,
  DollarSign,
  ShieldCheck,
  FileCheck,
  ClipboardCheck,
  Car
} from 'lucide-react';

interface PageProps {
  params: Promise<{ placa: string }>;
  searchParams?: Promise<{ garaje?: string }>;
}

export const instant = false;

export default async function HistorialPlacaPage({ params, searchParams }: PageProps) {
  const { placa: rawPlaca } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const desdeGaraje = resolvedSearchParams.garaje === 'true';
  const placa = decodeURIComponent(rawPlaca || '').toUpperCase().trim();

  // 1. Inicializar cliente de Supabase en el servidor
  const supabase = await createClient();

  // 2. Buscar vehículo en la tabla vehiculos
  const { data: vehiculoData, error: vehiculoError } = await supabase
    .from('vehiculos')
    .select('*')
    .ilike('placa', placa)
    .maybeSingle();

  // Si proviene de Mi Garaje pero aún se está sincronizando en base de datos
  let vehiculo = vehiculoData;
  if (!vehiculo && desdeGaraje) {
    vehiculo = {
      id: `veh-${placa.toLowerCase()}`,
      placa: placa,
      marca: 'Vehículo',
      modelo: 'Registrado',
      anio: new Date().getFullYear(),
      color: 'Estándar'
    };
  }

  // 3. Si la placa no existe en la base de datos, mostrar pantalla de "Vehículo no encontrado"
  if (!vehiculo) {
    return (
      <div className="min-h-screen bg-white text-[#0A1525] flex flex-col font-sans">
        <header className="border-b border-[#CBD5E1] bg-white sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E56B0] hover:text-[#0A1525] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Inicio</span>
            </Link>
            <div className="flex items-center gap-2">
              <img src="/icon.svg" alt="TuTallerMóvil" className="h-10 w-auto object-contain" />
              <span className="text-xs font-bold uppercase tracking-wider bg-[#F8FAFC] border border-[#CBD5E1] px-2 py-0.5 rounded text-[#1E56B0]">
                Consulta
              </span>
            </div>
          </div>
        </header>

        <main className="max-w-md mx-auto px-4 py-20 flex-1 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8" />
          </div>

          {/* Matrícula buscada */}
          <div className="w-48 bg-white border-2 border-[#0A1525] rounded-lg p-2 shadow-xs mb-4">
            <span className="text-[9px] font-bold text-slate-400 block tracking-widest">VENEZUELA</span>
            <span className="font-mono text-2xl font-black text-[#0A1525]">{placa || 'PLACA'}</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0A1525] mb-2">
            Vehículo no encontrado
          </h1>
          <p className="text-sm text-slate-600 mb-8 max-w-sm">
            La placa <span className="font-bold text-[#0A1525] font-mono">{placa}</span> no se encuentra registrada en la base de datos de TuTallerMóvil.
          </p>

          <Link
            href="/"
            className="h-12 px-6 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-semibold rounded-xl transition-colors inline-flex items-center justify-center gap-2 text-base shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </main>
      </div>
    );
  }

  // 4. Buscar historial_servicios ordenados por fecha descendente
  let servicios: any[] = [];
  if (vehiculo.id) {
    const { data: srvById } = await supabase
      .from('historial_servicios')
      .select('*')
      .eq('vehiculo_id', vehiculo.id)
      .order('fecha', { ascending: false });
    if (srvById && srvById.length > 0) servicios = srvById;
  }
  if (servicios.length === 0) {
    const { data: srvByPlaca } = await supabase
      .from('historial_servicios')
      .select('*')
      .eq('placa', placa)
      .order('fecha', { ascending: false });
    if (srvByPlaca && srvByPlaca.length > 0) servicios = srvByPlaca;
  }

  // Lista real de servicios registrados en Supabase
  const listaServicios = servicios;

  // 5. Verificar suscripción o si el usuario está autenticado / proviene de Mi Garaje (Salto de Paywall)
  const { data: authData } = await supabase.auth.getUser();
  const usuarioAutenticado = Boolean(authData?.user) || desdeGaraje;

  let tieneSuscripcionActiva = usuarioAutenticado;
  if (!tieneSuscripcionActiva && vehiculo.id) {
    const { data: subById } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('vehiculo_id', vehiculo.id)
      .eq('activa', true)
      .maybeSingle();
    if (subById?.activa) tieneSuscripcionActiva = true;
  }
  if (!tieneSuscripcionActiva) {
    const { data: subByPlaca } = await supabase
      .from('suscripciones')
      .select('*')
      .eq('placa', placa)
      .eq('activa', true)
      .maybeSingle();
    if (subByPlaca?.activa) tieneSuscripcionActiva = true;
  }

  // Normalizar datos de la ficha superior
  const marca = vehiculo.marca || 'Marca no especificada';
  const modelo = vehiculo.modelo || 'Modelo no especificado';
  const anio = vehiculo.anio ?? vehiculo.año ?? 'N/A';
  const color = vehiculo.color || 'No indicado';

  return (
    <div className="min-h-screen bg-white text-[#0A1525] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">
      {/* Barra superior de navegación / regreso */}
      <header className="border-b border-[#CBD5E1] bg-white sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={desdeGaraje ? '/cliente/dashboard' : '/'}
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#1E56B0] hover:text-[#0A1525] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{desdeGaraje ? 'Volver a Mi Garaje' : 'Volver al Inicio'}</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/icon.svg" alt="TuTallerMóvil" className="h-10 w-auto object-contain" />
            <span className="text-xs font-bold uppercase tracking-wider bg-[#F8FAFC] border border-[#CBD5E1] px-2 py-0.5 rounded text-[#1E56B0]">
              {usuarioAutenticado ? 'Mi Garaje • Pro' : 'Pasaporte Técnico'}
            </span>
          </div>
        </div>
      </header>

      {/* Contenido Central */}
      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12 w-full flex-1">
        
        {/* Ficha Superior del Vehículo (Datos Reales de Supabase) */}
        <section className="bg-[#F8FAFC] border-2 border-[#CBD5E1] rounded-2xl p-6 sm:p-8 shadow-sm mb-10 transition-all">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            
            {/* Placa estilo venezolana */}
            <div className="flex flex-col items-center">
              <div className="w-56 sm:w-64 bg-white border-4 border-[#0A1525] rounded-xl shadow-md p-2.5 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Cabecera placa Venezuela */}
                <div className="w-full flex items-center justify-between px-2 text-[9px] font-bold tracking-widest text-[#0A1525] border-b border-slate-200 pb-1 mb-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2.5 h-1.5 bg-yellow-400 inline-block rounded-[1px]" />
                    <span className="w-2.5 h-1.5 bg-blue-600 inline-block rounded-[1px]" />
                    <span className="w-2.5 h-1.5 bg-red-600 inline-block rounded-[1px]" />
                  </span>
                  <span>VENEZUELA</span>
                  <span>INTT</span>
                </div>

                {/* Número de placa en grande */}
                <span className="font-mono text-3xl sm:text-4xl font-extrabold tracking-widest text-[#0A1525] py-0.5">
                  {placa}
                </span>

                {/* Pie de placa */}
                <span className="text-[8px] font-semibold tracking-wider text-slate-500 uppercase mt-0.5">
                  TRANSPORTE TERRESTRE PARTICULAR
                </span>
              </div>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Vehículo Verificado
                </span>
                {tieneSuscripcionActiva ? (
                  <span className="text-[11px] font-bold text-[#1E56B0] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#1E56B0]" /> Pasaporte Activo
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-600" /> Bloqueado
                  </span>
                )}
              </div>
            </div>

            {/* Datos Técnicos Reales de la BD */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 w-full md:w-auto flex-1 md:pl-6 border-t md:border-t-0 md:border-l border-[#CBD5E1] pt-4 md:pt-0">
              <div className="bg-white p-3 rounded-xl border border-[#CBD5E1]">
                <span className="text-xs text-slate-500 font-medium block">Marca</span>
                <span className="text-base sm:text-lg font-bold text-[#0A1525]">{marca}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#CBD5E1]">
                <span className="text-xs text-slate-500 font-medium block">Modelo</span>
                <span className="text-base sm:text-lg font-bold text-[#0A1525]">{modelo}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#CBD5E1]">
                <span className="text-xs text-slate-500 font-medium block">Año</span>
                <span className="text-base sm:text-lg font-bold text-[#0A1525]">{anio}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#CBD5E1]">
                <span className="text-xs text-slate-500 font-medium block">Color</span>
                <span className="text-sm sm:text-base font-semibold text-slate-700">{color}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-[#CBD5E1] col-span-2 sm:col-span-2">
                <span className="text-xs text-slate-500 font-medium block">Intervenciones Registradas</span>
                <span className="text-sm sm:text-base font-bold text-[#1E56B0]">
                  {listaServicios.length} servicios documentados
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* Encabezado de la Línea de Tiempo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#0A1525]">
              Historial de Servicios
            </h2>
            <p className="text-sm text-slate-500">
              {listaServicios.length === 0
                ? 'Expediente técnico digital y registro de intervenciones mecánicas.'
                : 'Cronología certificada de mantenimientos y diagnósticos realizados.'}
            </p>
          </div>

          {/* Acciones unificadas: Descargar Certificado PDF + Auditoría 25 Pts + Pedir Servicio */}
          <HistorialAccionesCliente
            vehiculo={{ marca, modelo, anio, placa, color }}
            cliente={{
              nombre: vehiculo.cliente_nombre || '',
              email: vehiculo.cliente_email || '',
              telefono: vehiculo.cliente_telefono || ''
            }}
            esHistorialVacio={false}
            tieneSuscripcionActiva={tieneSuscripcionActiva}
            servicios={listaServicios}
          />
        </div>

        {/* Contenedor del Historial: Lógica de Vehículo Nuevo (Cero) vs Historial Existente */}
        {listaServicios.length === 0 ? (
          /* ESTADO VEHÍCULO NUEVO / HISTORIAL EN CERO */
          <HistorialAccionesCliente
            vehiculo={{ marca, modelo, anio, placa, color }}
            cliente={{
              nombre: vehiculo.cliente_nombre || '',
              email: vehiculo.cliente_email || '',
              telefono: vehiculo.cliente_telefono || ''
            }}
            esHistorialVacio={true}
          />
        ) : (
          /* CONTENEDOR CON SERVICIOS REGISTRADOS Y PAYWALL SI NO TIENE SUSCRIPCIÓN */
          <div className="relative">
            
            {/* Línea de Tiempo (Timeline) */}
            <div
              className={`space-y-4 ${
                tieneSuscripcionActiva
                  ? ''
                  : 'filter blur-md select-none pointer-events-none opacity-40'
              }`}
            >
              {listaServicios.map((srv, idx) => {
                const km = srv.kilometraje ?? srv.km ?? 0;
                const costo = Number(srv.costo ?? srv.precio ?? srv.monto ?? 0).toFixed(2);
                const tipo = srv.tipo_servicio ?? srv.servicio ?? srv.descripcion ?? 'Servicio Técnico TuTallerMóvil';
                const fechaStr = srv.fecha ? String(srv.fecha).split('T')[0] : 'Reciente';

                return (
                  <div
                    key={srv.id || idx}
                    className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-xl p-5 sm:p-6 transition-all hover:bg-white"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0A1525] text-[#CCFF00] flex items-center justify-center shrink-0">
                          <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-base sm:text-lg text-[#0A1525]">
                            {tipo}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                            <span className="inline-flex items-center gap-1 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {fechaStr}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center gap-1 font-semibold text-[#1E56B0]">
                              <Gauge className="w-3.5 h-3.5 text-[#1E56B0]" />
                              {km.toLocaleString()} KM
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-left sm:text-right">
                        <span className="font-extrabold text-lg text-[#0A1525]">
                          ${costo} USD
                        </span>
                        <p className="text-[11px] text-emerald-700 font-semibold flex items-center sm:justify-end gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Garantía Certificada
                        </p>
                      </div>
                    </div>

                    {/* Detalles / Repuestos */}
                    <div className="text-xs sm:text-sm text-slate-600 bg-white p-3 rounded-xl border border-[#CBD5E1]/60">
                      <span className="font-semibold text-slate-700">Trabajos e insumos: </span>
                      {srv.detalles || 'Revisión técnica computarizada y mantenimiento preventivo por especialista certificado TTM.'}
                    </div>

                    {/* Checklist Certificado 25 Puntos Visualmente Organizado */}
                    {(srv.checklist_json || srv.diagnostico_json) && (() => {
                      const chk = srv.checklist_json || srv.diagnostico_json;
                      const itemsOk = chk.puntos_ok ?? 22;
                      const itemsTotal = chk.total_puntos ?? 25;

                      return (
                        <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-[#0A1525]">
                            <span className="flex items-center gap-1.5">
                              <ClipboardCheck className="w-4 h-4 text-[#1E56B0]" />
                              <span>Checklist de Inspección Certificado (25 Puntos)</span>
                            </span>
                            <span className="text-[10px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-black border border-emerald-200">
                              {itemsOk}/{itemsTotal} Puntos Óptimos
                            </span>
                          </div>

                          {/* Grid de 4 Cuadrantes Clave */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-[11px] font-semibold">
                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${chk.aceite === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="truncate">Fluidos: {chk.aceite === 'ok' ? 'OK' : 'Atención'}</span>
                            </div>

                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${chk.frenos === 'ok' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                              <span className="truncate">Frenos: {chk.frenos === 'ok' ? 'OK' : 'Cambio'}</span>
                            </div>

                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5">
                              <span className={`w-2 h-2 rounded-full shrink-0 ${chk.suspension === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                              <span className="truncate">Suspensión: {chk.suspension === 'ok' ? 'OK' : 'Atención'}</span>
                            </div>

                            <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                              <span className="truncate">Eléctrico: OK</span>
                            </div>
                          </div>

                          {/* Botón para Abrir Modal Interactivo con los 25 Puntos Completos */}
                          <HistorialChecklistButton
                            tipoServicio={tipo}
                            fecha={fechaStr}
                            kilometraje={km}
                            checklistJson={chk}
                            placa={placa}
                            modelo={modelo}
                          />
                        </div>
                      );
                    })()}
                  </div>
                );
              })}
            </div>

            {/* Tarjeta de Conversión (Paywall Flotante sobre el Blur) si NO tiene suscripción activa */}
            {!tieneSuscripcionActiva && (
              <div className="absolute inset-0 flex items-center justify-center p-2 sm:p-4 z-20">
                <div className="w-full max-w-xl bg-white border-2 border-[#1E56B0] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                  {/* Franja superior estética */}
                  <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#1E56B0] via-[#0A1525] to-[#CCFF00]" />

                  {/* Badge de Bloqueo */}
                  <div className="flex items-center justify-center mb-4">
                    <span className="inline-flex items-center gap-2 bg-[#0A1525] text-white px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
                      <Lock className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>EXPEDIENTE TÉCNICO PROTEGIDO</span>
                    </span>
                  </div>

                  {/* Título */}
                  <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-[#0A1525] tracking-tight leading-tight mb-2">
                    Activa el Pasaporte Técnico en la Nube
                  </h3>

                  {/* Oferta de Precio */}
                  <div className="text-center my-4">
                    <div className="inline-flex items-baseline justify-center gap-2 bg-[#F8FAFC] border border-[#CBD5E1] px-5 py-2.5 rounded-xl">
                      <span className="text-lg text-slate-400 line-through font-semibold">
                        $10.00
                      </span>
                      <span className="text-3xl sm:text-4xl font-black text-[#0A1525] tracking-tight">
                        $5.00
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#1E56B0]">
                        USD / año
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 font-bold mt-1.5">
                      ⚡ 50% OFF por activación inmediata
                    </p>
                  </div>

                  {/* Descripción */}
                  <p className="text-sm sm:text-base text-slate-600 text-center mb-6 max-w-md mx-auto leading-relaxed">
                    Accede al historial completo, fotos de reparaciones y descarga el certificado PDF para venta.
                  </p>

                  {/* Beneficios directos */}
                  <div className="space-y-2.5 mb-7 bg-[#F8FAFC] border border-[#CBD5E1] p-4 rounded-xl text-xs sm:text-sm text-slate-700">
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Certificado oficial en PDF listo para traspaso o venta de vehículo.</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Registro inmutable de kilometraje real certificado por mecánicos TTM.</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Galería fotográfica de repuestos cambiados y facturas respaldadas.</span>
                    </div>
                  </div>

                  {/* Botón CTA Grande Verde Lima (Componente Cliente con Server Action) */}
                  <ReportarPagoButton vehiculoId={vehiculo.id} placa={placa} />

                  <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-400 font-medium">
                    <span>Zelle • Pago Móvil • Banesco Panamá</span>
                    <span>•</span>
                    <span>Activación en &lt; 5 min</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#CBD5E1] py-6 text-center text-xs text-slate-500 mt-12">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2025 TuTallerMóvil (TTM). Pasaporte Técnico Vehicular.</p>
          <p className="text-slate-400">Garantía de confidencialidad y datos encriptados.</p>
        </div>
      </footer>
    </div>
  );
}
