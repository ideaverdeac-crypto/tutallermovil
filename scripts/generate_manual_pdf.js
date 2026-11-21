const fs = require('fs');
const path = require('path');
const { jsPDF } = require('jspdf');
const autoTable = require('jspdf-autotable').default || require('jspdf-autotable');

function buildManualPDF() {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const PAGE_WIDTH = 210;
  const PAGE_HEIGHT = 297;
  const MARGIN_LEFT = 16;
  const MARGIN_RIGHT = 16;
  const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

  // Paleta de Colores Oficial TuTallerMóvil
  const COLOR_NAVY = [10, 21, 37];       // #0A1525
  const COLOR_BLUE = [30, 86, 176];      // #1E56B0
  const COLOR_LIME = [204, 255, 0];      // #CCFF00
  const COLOR_SLATE = [71, 85, 105];     // #475569
  const COLOR_LIGHT = [248, 250, 252];   // #F8FAFC
  const COLOR_BORDER = [226, 232, 240];  // #E2E8F0
  const COLOR_EMERALD = [16, 185, 129];  // #10B981

  // Función para Header de Páginas Interiores
  function drawHeader(title, sectionNumber) {
    doc.setFillColor(...COLOR_NAVY);
    doc.rect(0, 0, PAGE_WIDTH, 18, 'F');

    doc.setFillColor(...COLOR_LIME);
    doc.rect(0, 18, PAGE_WIDTH, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_LIME);
    doc.text('TUTALLERMÓVIL (TTM) • MANUAL OPERATIVO 2027', MARGIN_LEFT, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(`SECCIÓN ${sectionNumber}: ${title.toUpperCase()}`, PAGE_WIDTH - MARGIN_RIGHT, 11, { align: 'right' });
  }

  // Función para Footer de Páginas Interiores
  function drawFooter(pageCurrent, pageTotal) {
    doc.setDrawColor(...COLOR_BORDER);
    doc.setLineWidth(0.4);
    doc.line(MARGIN_LEFT, PAGE_HEIGHT - 12, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    doc.text('Documento Oficial de Operaciones • Plataforma Web: https://tutallermovil.vercel.app', MARGIN_LEFT, PAGE_HEIGHT - 7);
    doc.text(`Página ${pageCurrent} de ${pageTotal}`, PAGE_WIDTH - MARGIN_RIGHT, PAGE_HEIGHT - 7, { align: 'right' });
  }

  // Función para Cajas Informativas (Callouts)
  function drawCallout(x, y, w, h, title, text, type = 'blue') {
    const bg = type === 'lime' ? [247, 254, 231] : type === 'green' ? [236, 253, 245] : [239, 246, 255];
    const border = type === 'lime' ? [190, 242, 100] : type === 'green' ? [110, 231, 183] : [191, 219, 254];
    const titleColor = type === 'lime' ? [63, 98, 18] : type === 'green' ? [6, 95, 70] : [30, 86, 176];

    doc.setFillColor(...bg);
    doc.setDrawColor(...border);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, y, w, h, 2.5, 2.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...titleColor);
    doc.text(title, x + 4, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const splitLines = doc.splitTextToSize(text, w - 8);
    doc.text(splitLines, x + 4, y + 10.5);
  }

  // =========================================================================
  // PÁGINA 1: PORTADA EJECUTIVA
  // =========================================================================
  doc.setFillColor(...COLOR_NAVY);
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Franja Decorativa Superior
  doc.setFillColor(...COLOR_BLUE);
  doc.rect(0, 0, PAGE_WIDTH, 8, 'F');
  doc.setFillColor(...COLOR_LIME);
  doc.rect(0, 8, PAGE_WIDTH, 3, 'F');

  // Badge Oficial
  doc.setFillColor(255, 255, 255, 0.08);
  doc.roundedRect(MARGIN_LEFT, 32, 60, 8, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...COLOR_LIME);
  doc.text('★ PROTOCOLO CERTIFICADO 2027', MARGIN_LEFT + 4, 37.5);

  // Título Principal
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(255, 255, 255);
  doc.text('TuTallerMóvil', MARGIN_LEFT, 54);

  doc.setFontSize(14);
  doc.setTextColor(...COLOR_LIME);
  doc.text('Plataforma Integral de Asistencia y Despacho Mecánico', MARGIN_LEFT, 63);

  // Subtítulo y Descripción
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(203, 213, 225);
  const portadaDesc = 
    'Manual Operativo Oficial de Extremo a Extremo (E2E). Guía paso a paso para Clientes, Mecánicos Especialistas, ' +
    'Operadoras de Despacho, Runners y Casas de Repuestos. Procedimientos estandarizados desde la prospección del servicio ' +
    'hasta la conciliación bancaria y la emisión del Pasaporte Técnico Vehicular Digital.';
  doc.text(doc.splitTextToSize(portadaDesc, CONTENT_WIDTH), MARGIN_LEFT, 74);

  // Tarjeta Blanca Central con Resumen de Módulos
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(MARGIN_LEFT, 102, CONTENT_WIDTH, 120, 4, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('CONTENIDO DEL MANUAL POR ROLES Y OPERACIONES', MARGIN_LEFT + 8, 114);

  doc.setDrawColor(...COLOR_BORDER);
  doc.setLineWidth(0.5);
  doc.line(MARGIN_LEFT + 8, 118, MARGIN_LEFT + CONTENT_WIDTH - 8, 118);

  const modulos = [
    { num: '01', rol: 'CLIENTES PARTICULARES Y FLOTAS', desc: 'Registro, Mi Garaje, solicitud web y por WhatsApp Bot, aprobación de presupuesto y Pasaporte Técnico.' },
    { num: '02', rol: 'OPERADORAS (TORRE DE DESPACHO)', desc: 'Gestión en Tablero Kanban, asignación de especialistas, cotizador B2B, candado de concurrencia y pagos.' },
    { num: '03', rol: 'MECÁNICOS ALIADOS EN CALLE', desc: 'Wizard móvil táctil, foto del odómetro inicial, auditoría de 25 puntos, fotos viejo/nuevo y prueba de ruta.' },
    { num: '04', rol: 'RUNNERS Y CASAS DE REPUESTOS', desc: 'Despacho express, validación obligatoria de PIN de 4 dígitos en mostrador y traslado seguro de piezas.' },
    { num: '05', rol: 'SISTEMA DE GARANTÍA QA Y REGLAS TTM', desc: 'Regla $40 USD (diagnóstico gratis), Fondo de Garantía QA del 3% y contingencias operativas (P0-03).' }
  ];

  let modY = 126;
  modulos.forEach((m) => {
    doc.setFillColor(...COLOR_BLUE);
    doc.roundedRect(MARGIN_LEFT + 8, modY - 4, 9, 7, 1.5, 1.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text(m.num, MARGIN_LEFT + 10, modY + 1);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_NAVY);
    doc.text(m.rol, MARGIN_LEFT + 22, modY);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    const splitDesc = doc.splitTextToSize(m.desc, CONTENT_WIDTH - 30);
    doc.text(splitDesc, MARGIN_LEFT + 22, modY + 4.5);

    modY += 19;
  });

  // Pie de Portada
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Versión de Producción: 1.0.0 (Release Beta) • Supabase PostgreSQL • Vercel Edge Network', MARGIN_LEFT, PAGE_HEIGHT - 22);
  doc.text('Acceso a la Plataforma en Vivo: https://tutallermovil.vercel.app', MARGIN_LEFT, PAGE_HEIGHT - 17);

  doc.setFillColor(...COLOR_LIME);
  doc.rect(0, PAGE_HEIGHT - 4, PAGE_WIDTH, 4, 'F');

  // =========================================================================
  // PÁGINA 2: ARQUITECTURA GENERAL Y MAPA DE ROLES (RBAC)
  // =========================================================================
  doc.addPage();
  drawHeader('Arquitectura del Sistema y Control de Acceso', '1');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('1. El Ecosistema Digital de TuTallerMóvil', MARGIN_LEFT, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SLATE);
  const p1Text = 
    'TuTallerMóvil opera bajo un modelo de plataforma multimodal (Marketplace B2B/B2C) diseñado bajo el principio ' +
    'de cero fricción, auditoría digital médica y estricto control de calidad. Conecta la demanda de clientes particulares ' +
    'y flotas corporativas con mecánicos certificados, corredores de repuestos (Runners) y proveedores mayoristas, ' +
    'coordinados centralmente desde la Torre de Despacho.';
  doc.text(doc.splitTextToSize(p1Text, CONTENT_WIDTH), MARGIN_LEFT, 35);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('Matriz de Actores, Credenciales y Enlaces de Producción', MARGIN_LEFT, 52);

  autoTable(doc, {
    startY: 56,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    head: [['Rol Operativo', 'Vía de Ingreso', 'URL en Producción', 'Objetivo Principal']],
    body: [
      ['Cliente Particular', 'Google OAuth o Email/Password', '/login-cliente\n/cliente/dashboard', 'Solicitar mecánicos, consultar pasaporte técnico y aprobar presupuestos.'],
      ['Cliente Corporativo', 'Credencial Corporativa B2B', '/flotas/dashboard', 'Monitoreo masivo de flotas, presupuestos consolidados y SLAs corporativos.'],
      ['Operadora de Despacho', 'Pestaña Staff (Email + Contraseña)', '/login\n/admin/despacho', 'Triage en Kanban, asignación de especialistas, cotizador B2B y WhatsApp.'],
      ['Mecánico Aliado', 'Código Aliado (#TTM-XXXX) + PIN', '/login\n/aliados/portal', 'Inspección de 25 puntos, diagnóstico de repuestos y prueba de ruta.'],
      ['Runner (Logística)', 'Código Aliado (#RUN-XXXX) + PIN', '/login\n/runner/portal', 'Retiro con PIN en casa de repuestos y traslado express al especialista.'],
      ['Casa de Repuestos', 'Código Aliado (#REP-XXXX) + PIN', '/login\n/repuestos/pedidos', 'Recepción de órdenes de compra B2B y despacho seguro tras validar PIN.']
    ],
    theme: 'grid',
    headStyles: { fillColor: COLOR_NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59], cellPadding: 2.2 },
    alternateRowStyles: { fillColor: COLOR_LIGHT }
  });

  const tablaFinalY = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('Ciclo de Vida de una Orden de Trabajo', MARGIN_LEFT, tablaFinalY);

  autoTable(doc, {
    startY: tablaFinalY + 4,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    head: [['Fase', 'Estado en Sistema', 'Actor Responsable', 'Acción y Regla Clave']],
    body: [
      ['1. Entrada', 'LEAD_NUEVO', 'Cliente / Bot WhatsApp', 'Se captura teléfono, placa, vehículo y síntoma reportado.'],
      ['2. Triage', 'EN_INSPECCION', 'Operadora (Despacho)', 'Se activa candado bloqueado_por y se asigna técnico más cercano.'],
      ['3. Diagnóstico', 'COTIZADO', 'Mecánico en Sitio', 'Foto de odómetro inicial y checklist de 25 puntos en 4 módulos.'],
      ['4. Aprobación', 'APROBADO', 'Cliente en Portal', 'Aprobación del presupuesto (Regla: Diagnóstico gratis si > $40 USD).'],
      ['5. Suministro', 'REPUESTOS_EN_RUTA', 'Runner + Proveedor', 'Validación obligatoria de PIN de 4 dígitos en mostrador de repuestos.'],
      ['6. Montaje', 'EN_EJECUCION', 'Mecánico Especialista', 'Fotos certificadas obligatorias de repuesto viejo vs repuesto nuevo.'],
      ['7. Control', 'PENDIENTE_PAGO', 'Mecánico + Cliente', 'Prueba de ruta: sistema valida que Odómetro Final > Odómetro Inicial.'],
      ['8. Cierre', 'PAGADO & CONCILIADO', 'Operadora (Despacho)', 'Conciliación bancaria, retención del 3% QA y emisión de Pasaporte.']
    ],
    theme: 'grid',
    headStyles: { fillColor: COLOR_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 2 },
    alternateRowStyles: { fillColor: COLOR_LIGHT }
  });

  drawFooter(2, 6);

  // =========================================================================
  // PÁGINA 3: GUÍA PARA CLIENTES (B2C Y FLOTAS)
  // =========================================================================
  doc.addPage();
  drawHeader('Manual del Cliente: Mi Garaje y Servicios', '2');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('2. Experiencia y Portal del Cliente', MARGIN_LEFT, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(
    'El cliente disfruta de una experiencia transparente y sin costos ocultos desde el primer contacto, ' +
    'con acceso permanente al historial clínico de sus vehículos en "Mi Garaje".',
    MARGIN_LEFT, 35
  );

  const pasosCliente = [
    {
      num: 'Paso 1',
      tit: 'Registro e Inicio de Sesión Inteligente',
      desc: 'El cliente accede a /login-cliente y puede ingresar con un solo clic mediante su cuenta de Google o con correo/contraseña. Si es un usuario nuevo, su Garaje inicia limpio en cero, sin vehículos precargados ficticios.'
    },
    {
      num: 'Paso 2',
      tit: 'Solicitud de Servicio (Landing o WhatsApp Nativo)',
      desc: 'Puede solicitar un mecánico desde el botón principal de la Landing Page o escribiendo directamente al WhatsApp oficial. El Bot interactivo le preguntará nombre, modelo del carro y falla, generando la orden en segundos sin pedir datos duplicados si ya tiene sesión iniciada.'
    },
    {
      num: 'Paso 3',
      tit: 'Garantía TTM Oficial de Diagnóstico',
      desc: 'La plataforma estipula: "Diagnóstico inicial $15 USD. Si la cotización final de reparación es mayor a $40 USD, el diagnóstico es COMPLETAMENTE GRATIS ($0.00). Sin costos ocultos".'
    },
    {
      num: 'Paso 4',
      tit: 'Aprobación del Presupuesto en Tiempo Real',
      desc: 'Tras el diagnóstico de 25 puntos en sitio, el cliente recibe el desglose de repuestos y mano de obra en su pantalla. Puede presionar "Aprobar Cotización" con un toque, o si decide no reparar, pagar solo la tarifa base de diagnóstico de $15 USD sin penalizaciones.'
    },
    {
      num: 'Paso 5',
      tit: 'Pasaporte Técnico Digital Vehicular',
      desc: 'Al finalizar la reparación, el cliente recibe su comprobante digital y puede consultar su Pasaporte Técnico en /historial/[placa], con odómetro certificado, fotos de piezas sustituidas y respaldo de garantía por 30 días o 1,000 KM.'
    }
  ];

  let pY = 44;
  pasosCliente.forEach((p) => {
    doc.setFillColor(...COLOR_LIGHT);
    doc.setDrawColor(...COLOR_BORDER);
    doc.roundedRect(MARGIN_LEFT, pY, CONTENT_WIDTH, 20, 2, 2, 'FD');

    doc.setFillColor(...COLOR_BLUE);
    doc.roundedRect(MARGIN_LEFT + 3, pY + 3, 14, 5, 1, 1, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);
    doc.text(p.num, MARGIN_LEFT + 4.5, pY + 6.8);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_NAVY);
    doc.text(p.tit, MARGIN_LEFT + 20, pY + 6.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    const splitTxt = doc.splitTextToSize(p.desc, CONTENT_WIDTH - 24);
    doc.text(splitTxt, MARGIN_LEFT + 20, pY + 11.5);

    pY += 23;
  });

  drawCallout(
    MARGIN_LEFT, pY + 4, CONTENT_WIDTH, 22,
    '🛡️ Garantía de Calidad y Cero Paywalls en Mi Garaje',
    'Los clientes registrados en Mi Garaje cuentan con acceso de por vida al historial técnico de sus automóviles, ' +
    'lo que incrementa el valor de reventa del vehículo al contar con un expediente inmutable de kilometraje fidedigno ' +
    'y repuestos genuinos certificados por TuTallerMóvil.',
    'lime'
  );

  drawFooter(3, 6);

  // =========================================================================
  // PÁGINA 4: GUÍA PARA OPERADORAS (TORRE DE DESPACHO)
  // =========================================================================
  doc.addPage();
  drawHeader('Manual de Operaciones: Torre de Despacho', '3');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('3. Centro de Comando y Despacho Operativo', MARGIN_LEFT, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(
    'La Torre de Despacho (/admin/despacho) es el núcleo neural donde las operadoras coordinan la flota, ' +
    'cotizan repuestos, gestionan las comunicaciones de WhatsApp y concilian los pagos de los servicios.',
    MARGIN_LEFT, 35
  );

  const operadoraCards = [
    {
      title: 'A. Tablero Kanban en Tiempo Real',
      desc: 'Monitoreo de 6 columnas operativas: Leads Nuevos ➔ En Inspección ➔ Cotizado ➔ Repuestos en Ruta ➔ En Ejecución ➔ Pendiente Pago. Los cambios de estado realizados por mecánicos o clientes se actualizan al instante mediante Supabase Realtime sin necesidad de refrescar la pantalla.'
    },
    {
      title: 'B. Candado Anticolisión (Optimistic Concurrency)',
      desc: 'Cuando una operadora abre o arrastra una tarjeta, el campo bloqueado_por se asocia a su correo institucional. Si otra operadora intenta mover la misma orden en paralelo, el sistema aborta la acción, revierte la posición visual y emite una alerta preventiva.'
    },
    {
      title: 'C. Bandeja Unificada de WhatsApp & Handoff Humano',
      desc: 'Integración oficial con Meta Graph API. La operadora puede ver los chats entrantes, revisar los datos que el Bot extrajo automáticamente (Nombre, Vehículo y Falla) y presionar "Tomar Control Humano" para responder directamente desde la interfaz estilo WhatsApp Web.'
    },
    {
      title: 'D. Cotizador B2B y Catálogo Mayorista',
      desc: 'Al recibir el diagnóstico de 25 puntos, la operadora selecciona los repuestos del inventario mayorista y añade la mano de obra. El cotizador aplica automáticamente la regla de $40 USD para exonerar el diagnóstico y calcula el margen de rentabilidad institucional.'
    },
    {
      title: 'E. Conciliación y Retención del 3% (Fondo QA)',
      desc: 'Al verificar el pago del cliente (Pago Móvil, Zelle o Efectivo), la operadora ejecuta la conciliación. El sistema retiene de forma obligatoria el 3% para el Fondo de Garantía QA, liquida el saldo neto al mecánico/runner y archiva la orden en "Servicios del Día".'
    }
  ];

  let opY = 43;
  operadoraCards.forEach((c) => {
    doc.setFillColor(...COLOR_LIGHT);
    doc.setDrawColor(...COLOR_BORDER);
    doc.roundedRect(MARGIN_LEFT, opY, CONTENT_WIDTH, 20.5, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_NAVY);
    doc.text(c.title, MARGIN_LEFT + 4, opY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    const splitC = doc.splitTextToSize(c.desc, CONTENT_WIDTH - 8);
    doc.text(splitC, MARGIN_LEFT + 4, opY + 10);

    opY += 23.5;
  });

  drawCallout(
    MARGIN_LEFT, opY + 2, CONTENT_WIDTH, 20,
    '🔔 Notificaciones Push y Sonidos Diferenciados',
    'La Torre de Despacho cuenta con alertas sonoras institucionales: tono de campana especial para operadoras ' +
    'al ingresar un nuevo lead o reporte de pago, y tono de piano armónico para mecánicos al recibir asignación de servicio.',
    'blue'
  );

  drawFooter(4, 6);

  // =========================================================================
  // PÁGINA 5: GUÍA PARA MECÁNICOS ESPECIALISTAS EN CALLE
  // =========================================================================
  doc.addPage();
  drawHeader('Manual del Especialista: Inspección y Trabajo', '4');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('4. Consola Móvil del Mecánico en Sitio', MARGIN_LEFT, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(
    'El especialista opera desde su smartphone en el portal móvil (/aliados/servicio/[id]). ' +
    'El sistema guía al técnico en un Wizard secuencial de 5 fases para garantizar la calidad del servicio.',
    MARGIN_LEFT, 35
  );

  autoTable(doc, {
    startY: 42,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    head: [['Fase Wizard', 'Nombre de la Etapa', 'Requisitos Obligatorios', 'Candado del Sistema']],
    body: [
      ['Fase 1', 'Odómetro & Llegada', 'Ingreso de KM inicial + Foto clara del tablero del auto.', 'No permite continuar sin foto válida.'],
      ['Fase 2', 'Checklist 25 Puntos', 'Evaluación de los 4 módulos técnicos y repuestos requeridos.', 'Genera diagnostico_json en BD.'],
      ['Fase 3', 'Espera de Cotización', 'Esperar aprobación de Despacho y del Cliente.', 'Pantalla en espera financiera con reloj.'],
      ['Fase 4', 'Montaje y Evidencias', 'Subida de 2 fotos: Pieza Vieja retirada vs Pieza Nueva montada.', 'Obligatorio ambas fotos en Storage.'],
      ['Fase 5', 'Prueba de Ruta & Cobro', 'Ingreso de Odómetro Final y validación de prueba de manejo.', 'Matemática: kmFinal > kmInicial obligatoria.']
    ],
    theme: 'grid',
    headStyles: { fillColor: COLOR_NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7.2, textColor: [30, 41, 59], cellPadding: 2.2 },
    alternateRowStyles: { fillColor: COLOR_LIGHT }
  });

  const checkY = doc.lastAutoTable.finalY + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('Desglose de los 4 Módulos del Checklist de 25 Puntos', MARGIN_LEFT, checkY);

  autoTable(doc, {
    startY: checkY + 4,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    head: [['Módulo Técnico', 'Puntos Evaluados', 'Criterio de Evaluación']],
    body: [
      ['1. Fluidos y Aceite (7 Pts)', 'Aceite de motor, líquido de frenos, refrigerante, dirección, lavaparabrisas, caja y fugas.', 'Viscosidad, nivel en varilla, porcentaje de humedad < 2% y hermeticidad de sellos.'],
      ['2. Sistema de Frenos (6 Pts)', 'Pastillas delanteras, traseras/bandas, discos, mangueras, freno de mano y calipers.', 'Grosor de pasta (> 4mm), rebaba en discos, ausencia de fugas y clics de freno de mano.'],
      ['3. Suspensión & Tren (6 Pts)', 'Amortiguadores, muñones/rótulas, terminales, bujes de meseta, barra y rodamientos.', 'Sin fuga hidráulica, guardapolvos sanos, sin holgura axial y giro silencioso de rueda.'],
      ['4. Sistema Eléctrico (6 Pts)', 'Luces altas/bajas, stop/cruces, bornes, estado de batería (CCA), alternador y correas.', 'Voltaje en ralentí (13.8V - 14.4V), bornes sin sulfato y correa sin grietas.']
    ],
    theme: 'grid',
    headStyles: { fillColor: COLOR_BLUE, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 2 },
    alternateRowStyles: { fillColor: COLOR_LIGHT }
  });

  drawCallout(
    MARGIN_LEFT, doc.lastAutoTable.finalY + 6, CONTENT_WIDTH, 18,
    '📶 Resiliencia ante Fallas de Conexión en Sótanos',
    'Si el técnico se encuentra en un estacionamiento subterráneo sin cobertura 4G, el sistema retiene las fotos ' +
    'en la memoria del dispositivo y despliega un botón de reintento automático sin perder el trabajo realizado.',
    'lime'
  );

  drawFooter(5, 6);

  // =========================================================================
  // PÁGINA 6: RUNNERS, CASAS DE REPUESTOS Y GARANTÍAS QA
  // =========================================================================
  doc.addPage();
  drawHeader('Logística de Repuestos y Protocolo QA', '5');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('5. Cadena de Suministro B2B y Políticas de Calidad', MARGIN_LEFT, 29);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...COLOR_SLATE);
  doc.text(
    'La logística de repuestos justa a tiempo (Just-in-Time) garantiza que el mecánico nunca deba abandonar ' +
    'el vehículo para comprar piezas, reduciendo el tiempo de servicio a menos de 45 minutos.',
    MARGIN_LEFT, 35
  );

  const supplyBoxes = [
    {
      title: 'Protocolo de Seguridad en Mostrador (PIN Blindado de 4 Dígitos)',
      desc: 'Cuando un Runner acude a la Casa de Repuestos proveedora (/repuestos/pedidos), la tienda tiene estrictamente bloqueada la entrega de la mercancía hasta que el Runner introduce su PIN de seguridad asignado (ej. 4829). Este mecanismo erradica extravíos, entregas erróneas o suplantaciones de identidad.'
    },
    {
      title: 'El Fondo de Garantía QA del 3% (Protección al Cliente)',
      desc: 'De cada orden liquidada, el sistema retiene un 3% en una cuenta custodia denominada "Fondo QA TuTallerMóvil". Este fondo cubre íntegramente cualquier garantía reportada durante los 30 días o 1,000 KM posteriores a la reparación, pagando al especialista el costo de una segunda visita sin debitar al cliente.'
    },
    {
      title: 'Procedimiento en caso de Cotización Rechazada (Parche P0-03)',
      desc: 'Si tras el diagnóstico el cliente decide no comprar los repuestos, la plataforma actualiza el estado a COTIZACION_RECHAZADA. El mecánico salta automáticamente a la Fase 5 exonerando la prueba de ruta y emite el cobro estricto de la tarifa base de diagnóstico de $15.00 USD, quedando liberado para otro servicio.'
    }
  ];

  let sY = 44;
  supplyBoxes.forEach((sb) => {
    doc.setFillColor(...COLOR_LIGHT);
    doc.setDrawColor(...COLOR_BORDER);
    doc.roundedRect(MARGIN_LEFT, sY, CONTENT_WIDTH, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(...COLOR_NAVY);
    doc.text(sb.title, MARGIN_LEFT + 4, sY + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...COLOR_SLATE);
    const splitSb = doc.splitTextToSize(sb.desc, CONTENT_WIDTH - 8);
    doc.text(splitSb, MARGIN_LEFT + 4, sY + 10);

    sY += 25;
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...COLOR_NAVY);
  doc.text('Directorio Oficial y Canales de Asistencia', MARGIN_LEFT, sY + 4);

  autoTable(doc, {
    startY: sY + 8,
    margin: { left: MARGIN_LEFT, right: MARGIN_RIGHT },
    head: [['Canal / Departamento', 'Contacto / URL', 'Horario de Cobertura', 'Alcance']],
    body: [
      ['Torre de Despacho Central', 'admin@tutallermovil.com\n/admin/despacho', 'Lunes a Domingo (7:00 AM - 8:00 PM)', 'Asignación, cotizaciones y conciliación bancaria.'],
      ['Soporte WhatsApp Bot', 'WhatsApp Oficial TuTallerMóvil\nAPI Meta Graph v20.0', '24 Horas / 7 Días (Automático)', 'Recepción de averías, leads y atención humana.'],
      ['Centro de Garantías QA', 'qa@tutallermovil.com', 'Horario de Oficina', 'Activación del fondo de 30 días o 1,000 km.'],
      ['Consultas de Pasaporte', '/historial/[placa]', '24 Horas / Público', 'Acceso inmutable al historial clínico de carros.']
    ],
    theme: 'grid',
    headStyles: { fillColor: COLOR_NAVY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 7.5 },
    bodyStyles: { fontSize: 7, textColor: [30, 41, 59], cellPadding: 2.2 },
    alternateRowStyles: { fillColor: COLOR_LIGHT }
  });

  drawFooter(6, 6);

  // Guardar archivo en disco
  const outputPath = path.join(process.cwd(), 'public', 'docs', 'Manual_Operativo_TuTallerMovil.pdf');
  const buffer = Buffer.from(doc.output('arraybuffer'));
  fs.writeFileSync(outputPath, buffer);

  // Copia en raíz del proyecto
  const rootPath = path.join(process.cwd(), 'MANUAL_OPERATIVO_TUTALLERMOVIL.pdf');
  fs.writeFileSync(rootPath, buffer);

  console.log(`✅ PDF Generado con éxito:`);
  console.log(`   - Web: ${outputPath}`);
  console.log(`   - Root: ${rootPath}`);
  console.log(`   - Peso: ${(buffer.length / 1024).toFixed(1)} KB`);
}

buildManualPDF();
