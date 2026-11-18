'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  FileText,
  Lock,
  Printer,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Car,
  Wrench,
  Store,
  Headphones,
  Calendar,
  ExternalLink,
  ChevronRight,
  Shield,
  Eye,
  DollarSign,
  QrCode,
  Layers,
  Database
} from 'lucide-react';

export default function TerminosYCondicionesPage() {
  const [seccionActiva, setSeccionActiva] = useState<string>('seccion-1');

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const secciones = [
    { id: 'seccion-1', num: 'I', titulo: 'Política de Privacidad y Protección de Datos' },
    { id: 'seccion-2', num: 'II', titulo: 'Condiciones para Clientes y Propietarios (B2C/B2B)' },
    { id: 'seccion-3', num: 'III', titulo: 'Términos para Mecánicos Móviles y Talleres' },
    { id: 'seccion-4', num: 'IV', titulo: 'Casas de Repuestos y Proveedores B2B' },
    { id: 'seccion-5', num: 'V', titulo: 'Normativa Interna para Operadoras y Mesa Central' },
    { id: 'seccion-6', num: 'VI', titulo: 'Matriz de Derechos y Obligaciones por Rol' },
    { id: 'seccion-7', num: 'VII', titulo: 'Propiedad Intelectual y Jurisdicción Legal' }
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 font-sans selection:bg-[#CCFF00] selection:text-[#0A1525]">
      {/* Header Corporativo Oficial */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 group transition-transform hover:scale-[1.02]"
              title="Volver a la página principal"
            >
              <img
                src="/icon.svg"
                alt="TuTallerMóvil"
                className="h-[45px] w-auto object-contain"
              />
            </Link>

            <div className="h-6 w-px bg-slate-200 hidden sm:block" />

            <div className="hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                <Scale className="w-3 h-3 text-[#1E56B0]" />
                Normativa Legal Oficial
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrint}
              className="h-10 px-3.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-2 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
              title="Imprimir o Guardar en PDF"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span className="hidden md:inline">Imprimir / PDF</span>
            </button>

            <Link
              href="/login-cliente?tab=registrarse"
              className="h-10 px-4 rounded-xl bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Registrarse</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#CCFF00]" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner Legal */}
      <section className="bg-[#0A1525] text-white py-12 sm:py-16 border-b border-slate-800 relative overflow-hidden">
        {/* Glows y Acentos Visuales */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#1E56B0]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#CCFF00]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-mono font-bold mb-4 border border-white/10 backdrop-blur-sm">
            <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
            <span>VIGENCIA LEGAL VINCULANTE • REPÚBLICA BOLIVARIANA DE VENEZUELA</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Términos, Condiciones de Uso y <br className="hidden sm:inline" />
            <span className="text-[#CCFF00]">Política Integral de Privacidad</span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-3xl leading-relaxed">
            Plataforma Tecnológica de Asistencia Automotriz • Caracas, Venezuela.
            Normativa aplicable a Usuarios Clientes (B2C/B2B), Mecánicos Móviles, Talleres Aliados, Casas de Repuestos y Operadoras.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 pt-2 text-xs font-medium text-slate-300">
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              Garantía de No Divulgación de Datos
            </span>
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <Scale className="w-3.5 h-3.5 text-[#CCFF00]" />
              Propiedad Intelectual SAPI Registrada
            </span>
            <span className="inline-flex items-center gap-1 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
              <QrCode className="w-3.5 h-3.5 text-sky-400" />
              Carnet Digital de Confianza
            </span>
          </div>
        </div>
      </section>

      {/* Contenedor Principal con Menú Lateral e Información Detallada */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Columna Izquierda: Índice Rápido Flotante */}
          <aside className="lg:col-span-4 sticky top-28 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#1E56B0]" />
                Índice de la Normativa
              </h3>
              <nav className="space-y-1">
                {secciones.map((sec) => (
                  <a
                    key={sec.id}
                    href={`#${sec.id}`}
                    onClick={() => setSeccionActiva(sec.id)}
                    className={`block px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${seccionActiva === sec.id
                      ? 'bg-[#0A1525] text-white shadow-xs'
                      : 'text-slate-600 hover:text-[#0A1525] hover:bg-slate-100'
                      }`}
                  >
                    <span className="font-mono text-[#CCFF00] mr-2">{sec.num}.</span>
                    <span>{sec.titulo}</span>
                  </a>
                ))}
              </nav>
            </div>

            {/* Tarjeta de Titularidad */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 text-xs text-slate-500 shadow-2xs">
              <p className="font-bold text-[#0A1525] mb-1">TuTallerMóvil (TTM)</p>
              <p>Titular de Propiedad Intelectual: <strong>José Ángel Acosta Llovera</strong></p>
              <p className="mt-1">Jurisdicción: Tribunales de Caracas, República Bolivariana de Venezuela.</p>
            </div>
          </aside>

          {/* Columna Derecha: Contenido Íntegro y Estructurado */}
          <article className="lg:col-span-8 space-y-8 bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm leading-relaxed">

            {/* Preámbulo Legal */}
            <div className="border-b border-slate-200 pb-6">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-sm leading-relaxed">
                <p className="font-bold text-[#0A1525] mb-2 text-base">
                  Preámbulo y Alcance General
                </p>
                <p>
                  El presente documento regula el acceso, navegación, registro y uso de la plataforma digital, aplicaciones web progresivas (PWA) y canales automatizados de mensajería de <strong>TUTALLERMÓVIL</strong> (en adelante, «<strong>LA PLATAFORMA</strong>»), cuyos derechos de propiedad intelectual pertenecen originariamente a <strong>José Ángel Acosta Llovera</strong>. El acceso o registro en cualquiera de los módulos del sistema implica la aceptación plena, vinculante e incondicional de estas disposiciones conforme al ordenamiento jurídico de la República Bolivariana de Venezuela.
                </p>
              </div>
            </div>

            {/* SECCIÓN I */}
            <section id="seccion-1" className="scroll-mt-28 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  I
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección I. Política de Privacidad y Protección Absoluta de Datos del Cliente
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                <Shield className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm">
                  <strong className="block text-emerald-900 font-black mb-1">
                    Garantía Expresa de Confidencialidad y No Divulgación:
                  </strong>
                  <p className="text-emerald-900 leading-relaxed">
                    LA PLATAFORMA garantiza de manera estricta y vinculante que <strong>no vende, alquila, cede, comercializa ni divulga bajo ninguna circunstancia</strong> los datos personales, números telefónicos, ubicaciones residenciales o laborales, identificaciones fiscales (RIF), seriales vehiculares ni el historial técnico de sus clientes a terceros, aseguradoras, concesionarios, agencias de mercadeo ni personas ajenas a la prestación del servicio solicitado.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-700 pl-2">
                <p>
                  <strong>Finalidad Única de los Datos:</strong> La información suministrada por el usuario (nombre, número telefónico, placa, marca, modelo, año, serial VIN, kilometraje y ubicación GPS) se utiliza exclusivamente para:
                </p>
                <ul className="list-disc pl-6 space-y-1.5 text-slate-700 text-xs sm:text-sm">
                  <li><strong>(a)</strong> Coordinar la asistencia mecánica en el cuadrante solicitado;</li>
                  <li><strong>(b)</strong> Cotizar y despachar los repuestos exactos compatibles con el vehículo;</li>
                  <li><strong>(c)</strong> Emitir el Carnet Digital de Confianza para autorizar el acceso del técnico; y</li>
                  <li><strong>(d)</strong> Construir y custodiar el Historial Médico del Carro.</li>
                </ul>

                <p>
                  <strong>Compartición Estrictamente Limitada en Campo:</strong> Durante una orden activa, el técnico o runner asignado visualiza únicamente los datos mínimos indispensables para llegar al punto y ejecutar el trabajo (nombre de pila, teléfono de enlace operativo, dirección de atención y datos del vehículo). Al cerrarse la orden, el acceso de contacto del aliado queda bloqueado.
                </p>

                <p>
                  <strong>Seguridad y Custodia en la Nube:</strong> Todos los registros vehiculares, fotografías de odómetro y reportes de escaneo OBD2 se almacenan cifrados bajo controles de acceso restringido. El titular del vehículo conserva el derecho a solicitar la actualización o rectificación de sus datos personales a través de los canales oficiales de soporte.
                </p>
              </div>
            </section>

            {/* SECCIÓN II */}
            <section id="seccion-2" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  II
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección II. Condiciones de Servicio para Clientes y Propietarios (B2C, Diáspora y Flotas B2B)
                </h2>
              </div>

              <div className="space-y-4 text-sm text-slate-700">
                {/* 2.1 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-[#0A1525] text-sm mb-1.5 flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-[#1E56B0]" />
                    2.1. Diagnóstico a Domicilio y Regla Comercial de Exoneración
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    La solicitud de visita técnica diagnóstica a domicilio tiene una tarifa base de <strong>quince dólares estadounidenses ($15,00 USD)</strong> o su equivalente en Bolívares a la tasa oficial del BCV. Si el cliente aprueba el presupuesto de reparación derivado de dicha inspección (suma de mano de obra y repuestos superior a $40,00 USD) dentro de la misma jornada operativa, LA PLATAFORMA <strong>exonerará automáticamente el costo del diagnóstico</strong>, descontando los $15,00 USD del monto total a pagar.
                  </p>
                </div>

                {/* 2.2 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-[#0A1525] text-sm mb-1.5 flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[#1E56B0]" />
                    2.2. Seguridad del Carnet Digital de Confianza y Garantía de Mano de Obra
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Antes del arribo del técnico, el cliente recibirá un enlace con el <strong>Carnet Digital de Confianza</strong> que incluye fotografía con uniforme oficial, cédula de identidad, rango técnico, vehículo de traslado y código QR verificable en tiempo real. El cliente debe verificar dicha credencial antes de autorizar el ingreso del especialista. Todos los trabajos ejecutados a través de LA PLATAFORMA cuentan con <strong>Garantía Total de Mano de Obra</strong> y respaldo con repuestos certificados; ante cualquier falla atribuible a la ejecución técnica, LA PLATAFORMA asignará un especialista senior de respaldo sin costo adicional para el usuario.
                  </p>
                </div>

                {/* 2.3 */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h3 className="font-black text-[#0A1525] text-sm mb-1.5 flex items-center gap-2">
                    <Database className="w-4 h-4 text-[#1E56B0]" />
                    2.3. Suscripción y Acceso al «Historial Médico del Carro»
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    El acceso digital del propietario al expediente técnico detallado en la nube (<code className="bg-slate-200 px-1 py-0.5 rounded font-mono text-xs">/historial/[placa]</code>) y la generación del certificado técnico descargable en PDF para revalorización de reventa operan bajo una suscripción anual de <strong>$10,00 USD</strong> (sujeta a tarifa promocional de lanzamiento de <strong>$5,00 USD/año</strong>). Una vez verificado el pago por la administración, el sistema activa la vigencia por 365 días y emite las credenciales personales de acceso (Usuario: Placa del vehículo; Clave: PIN numérico de 6 dígitos). Las credenciales son personales e intransferibles, salvo que el propietario decida compartirlas voluntariamente con un comprador potencial al momento de vender el automóvil.
                  </p>
                </div>

                {/* 2.4 */}
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950">
                  <h3 className="font-black text-rose-900 text-sm mb-1.5 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    2.4. Métodos de Pago y Prohibición de Pagos Directos al Personal de Calle
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-900 leading-relaxed">
                    Los pagos por servicios, repuestos y suscripciones se procesan exclusivamente mediante los canales autorizados por LA PLATAFORMA (Zelle, Pago Móvil interbancario o Efectivo en divisas debidamente reportado en la orden). <strong>Queda estrictamente prohibido realizar transferencias personales a cuentas particulares de mecánicos, runners o talleres</strong>; LA PLATAFORMA no asume responsabilidad ni otorga garantía sobre acuerdos o pagos efectuados por fuera de la mesa central.
                  </p>
                </div>
              </div>
            </section>

            {/* SECCIÓN III */}
            <section id="seccion-3" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  III
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección III. Términos de Uso para Mecánicos Móviles y Talleres Aliados Fijos
                </h2>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Naturaleza Mercantil Independiente:</strong> El acceso a la consola de campo (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">/campo</code>) y al portal de aliados (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">/aliados/portal</code>) está reservado a especialistas técnicos y talleres aliados vinculados bajo régimen mercantil independiente, sin relación de subordinación laboral.
                </p>

                <p>
                  <strong>Jerarquía Operativa y Alcance Técnico:</strong> Los especialistas operan según su rango certificado asignado en el sistema:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-black text-[#1E56B0] block text-sm">Mecánico 1</span>
                    <p className="text-slate-600 mt-1">Especialista Senior, diagnóstico electrónico OBD2, fallas complejas y rescates de garantía. <strong>80% de mano de obra</strong>.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-black text-emerald-600 block text-sm">Mecánico 2</span>
                    <p className="text-slate-600 mt-1">Técnico Certificado en mantenimiento preventivo y mecánica rápida estándar. <strong>75% de mano de obra</strong>.</p>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-black text-slate-700 block text-sm">Ayudante 1 / Talleres</span>
                    <p className="text-slate-600 mt-1">Auxiliar Técnico en servicios básicos o cuadrillas B2B. Talleres Fijos reciben mecánica mayor con <strong>20% de derivación</strong>.</p>
                  </div>
                </div>

                <p>
                  <strong>Candado Obligatorio del Odómetro e Historial Médico:</strong> Constituye requisito técnico indispensable para solicitar y liberar cualquier liquidación de honorarios que el especialista cargue en la plataforma la fotografía nítida y verídica del odómetro del vehículo, el checklist de inspección de 25 puntos y las fotografías de evidencia del servicio concluido. El sistema rechaza automáticamente registros de kilometraje inferiores o iguales al historial previo.
                </p>

                <p>
                  <strong>No Captación y Reserva de Datos:</strong> Queda estrictamente prohibido almacenar números telefónicos de clientes, contactar a usuarios fuera de la plataforma u ofrecer servicios directos eludiendo a LA PLATAFORMA. El incumplimiento conlleva la <strong>revocación inmediata del Carnet Digital QR y la expulsión definitiva de la red</strong>.
                </p>
              </div>
            </section>

            {/* SECCIÓN IV */}
            <section id="seccion-4" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  IV
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección IV. Términos de Uso para Casas de Repuestos y Proveedores Mayoristas B2B
                </h2>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Gestión de Órdenes y Compromiso de Inventario:</strong> Las casas de repuestos afiliadas acceden al portal mayorista para confirmar disponibilidad en tiempo real, respetar las listas de precios preferenciales B2B acordadas y preparar los pedidos rotulados en un <strong>plazo máximo de quince (15) minutos</strong> para su retiro por los motorizados (runners) identificados de LA PLATAFORMA.
                </p>

                <p>
                  <strong>Autenticidad y Garantía de Autopartes:</strong> El proveedor garantiza que el <strong>100% de las piezas despachadas son nuevas, originales o certificadas de fábrica y amparadas por factura fiscal legal</strong>. Queda prohibido el suministro de piezas usadas, reconstruidas o falsificadas. Todo componente cuenta con garantía contra defectos de fábrica y política de devolución o cambio dentro de las 48 horas siguientes si el empaque permanece intacto ante incompatibilidades técnicas.
                </p>
              </div>
            </section>

            {/* SECCIÓN V */}
            <section id="seccion-5" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  V
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección V. Normativa Interna para Operadoras, Coordinadoras y Personal Administrativo
                </h2>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <p>
                  <strong>Credenciales Individuales e Intransferibles:</strong> Cada operadora o integrante de la mesa central (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs">/admin/*</code>) ingresa con su propio usuario y contraseña corporativa. Está terminantemente prohibido compartir claves de acceso o dejar sesiones abiertas sin supervisión.
                </p>

                <p>
                  <strong>Bitácora de Auditoría Inmutable:</strong> La operadora acepta y reconoce expresamente que la plataforma cuenta con un registro de auditoría informática inmutable (<code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-xs font-bold text-[#1E56B0]">bitacora_operaciones</code>) que graba automáticamente su identidad, dirección de conexión, fecha y hora exacta de cada movimiento realizado dentro del sistema, incluyendo: asignación de mecánicos móviles, despacho de runners, aprobación o modificación de cotizaciones, exoneración de diagnósticos, gestión de compras de repuestos, validación de pagos y derivación a talleres aliados fijos.
                </p>

                <p>
                  <strong>Secreto Profesional y Protección de Bases de Datos:</strong> Todo el personal interno está obligado a guardar absoluta confidencialidad sobre la identidad de los clientes, las placas vehiculares, los márgenes comerciales y los procedimientos operativos de LA PLATAFORMA. La extracción, copia, fotografía o divulgación no autorizada de datos del CRM o del padrón vehicular constituye falta grave de probidad y dará lugar al despido justificado inmediato y al ejercicio de las acciones civiles y penales correspondientes.
                </p>
              </div>
            </section>

            {/* SECCIÓN VI - TABLA MATRIZ */}
            <section id="seccion-6" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  VI
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección VI. Resumen de Derechos, Accesos y Obligaciones por Rol en la Plataforma
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-600">
                Matriz de derechos y responsabilidades operativas según el perfil de usuario registrado:
              </p>

              {/* Tabla Responsive */}
              <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0A1525] text-white">
                      <th className="py-3 px-4 font-black uppercase tracking-wider text-[11px] w-1/4">Actor / Rol</th>
                      <th className="py-3 px-4 font-black uppercase tracking-wider text-[11px] w-1/3">Alcance en la Plataforma</th>
                      <th className="py-3 px-4 font-black uppercase tracking-wider text-[11px]">Compromiso Clave de Privacidad y Uso</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 bg-white">
                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0A1525]">
                        <div className="flex items-center gap-2">
                          <Car className="w-4 h-4 text-[#1E56B0] shrink-0" />
                          <span>Cliente / Propietario (B2C y B2B)</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        Agendamiento vía web y despacho central, verificación por Carnet QR, aprobación de presupuestos y consulta de Historial Médico anual ($5 promo / $10).
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium leading-relaxed">
                        Sus datos personales y vehiculares <strong>jamás son vendidos ni divulgados a terceros</strong>; custodia personal de su PIN de acceso al historial.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0A1525]">
                        <div className="flex items-center gap-2">
                          <Wrench className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Mecánicos Móviles (Niveles 1, 2 y Ayudante 1)</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        Aceptación de servicios en su cuadrante, ejecución en sitio, carga de foto de odómetro, checklist de 25 puntos y cobro de liquidaciones.
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium leading-relaxed">
                        Prohibición de contactar clientes por fuera; <strong>obligación de veracidad en el odómetro</strong> y uso exclusivo de repuestos enviados por runners.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0A1525]">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Talleres Aliados y Casas de Repuestos</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        Recepción de mecánica pesada (20%) con hoja de custodia; suministro mayorista B2B certificado con entrega rápida a runners.
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium leading-relaxed">
                        Custodia integral del vehículo en taller; <strong>piezas 100% nuevas y facturadas</strong>; no elusión comercial de clientes referidos.
                      </td>
                    </tr>

                    <tr className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#0A1525]">
                        <div className="flex items-center gap-2">
                          <Headphones className="w-4 h-4 text-purple-600 shrink-0" />
                          <span>Operadoras y Mesa Central</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 leading-relaxed">
                        Gestión del tablero Kanban de despacho, cotizador con regla de exoneración ($40), coordinación de runners y soporte al cliente.
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 font-medium leading-relaxed">
                        Uso de usuario individual auditado en tiempo real (logs con hora exacta); <strong>secreto absoluto sobre bases de datos y tarifas</strong>.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* SECCIÓN VII */}
            <section id="seccion-7" className="scroll-mt-28 space-y-4 pt-6 border-t border-slate-200">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A1525] text-[#CCFF00] font-black text-sm flex items-center justify-center shrink-0">
                  VII
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0A1525] tracking-tight">
                  Sección VII. Propiedad Intelectual, Modificaciones y Jurisdicción
                </h2>
              </div>

              <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
                <p>
                  El software, código fuente, arquitectura de base de datos, diseños gráficos, denominaciones, el <strong>Carnet Digital de Confianza</strong> y el sistema del <strong>Historial Médico del Carro</strong> están protegidos por la Ley sobre el Derecho de Autor y las normativas de propiedad intelectual ante el <strong>SAPI</strong>. Todos los derechos reservados a favor de <strong>José Ángel Acosta Llovera</strong>.
                </p>

                <p>
                  LA PLATAFORMA se reserva el derecho de actualizar estos Términos y Condiciones notificándolo a través de su sitio web oficial. Para cualquier controversia derivada de la interpretación o aplicación de este documento, las partes se someten a la legislación vigente y a la <strong>jurisdicción de los Tribunales Competentes de la ciudad de Caracas, República Bolivariana de Venezuela</strong>.
                </p>
              </div>
            </section>

            {/* Banner Final de Conformidad */}
            <div className="mt-10 p-6 rounded-2xl bg-gradient-to-r from-[#0A1525] to-[#1E56B0] text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#CCFF00] font-black">
                  Compromiso de Confianza TuTallerMóvil
                </span>
                <p className="text-xs sm:text-sm text-slate-200">
                  ¿Listo para crear tu cuenta o solicitar un servicio bajo esta garantía?
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <Link
                  href="/login-cliente?tab=registrarse"
                  className="h-10 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Car className="w-3.5 h-3.5 text-[#0A1525]" />
                  <span>Registrarme como Cliente</span>
                </Link>
                <Link
                  href="/registro"
                  className="h-10 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
                >
                  <Wrench className="w-3.5 h-3.5 text-slate-200" />
                  <span>Registro Aliados</span>
                </Link>
              </div>
            </div>

          </article>
        </div>
      </main>

      {/* Footer Legal */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© 2026 TuTallerMóvil. Titular: José Ángel Acosta Llovera. Todos los derechos reservados.</p>
          <p className="text-slate-400">Caracas, Venezuela • Plataforma Tecnológica de Asistencia Automotriz</p>
        </div>
      </footer>
    </div>
  );
}
