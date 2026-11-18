/**
 * Sistema de Notificaciones Push y Alertas Sonoras (Piano Elegante)
 * TuTallerMóvil 2027
 */

// Sintetizador Web Audio API de respaldo de alta fidelidad para el acorde de Piano Elegante
function sintetizarPianoEleganteWebAudio() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Acorde arpegiado C-Major 9th (Do mayor con novena elegante: C4, E4, G4, B4, D5, G5)
    const notas = [
      { f: 261.63, delay: 0.0, dur: 2.2, gain: 0.28 },
      { f: 329.63, delay: 0.16, dur: 2.0, gain: 0.24 },
      { f: 392.00, delay: 0.32, dur: 2.0, gain: 0.24 },
      { f: 493.88, delay: 0.48, dur: 2.2, gain: 0.22 },
      { f: 587.33, delay: 0.64, dur: 2.4, gain: 0.26 },
      { f: 783.99, delay: 0.82, dur: 2.8, gain: 0.30 },
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.85, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notas.forEach(({ f, delay, dur, gain }) => {
      const startTime = ctx.currentTime + delay;
      const endTime = startTime + dur;

      // Oscilador fundamental
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, startTime);

      // Armónico para brillo de piano acústico
      const oscHarmonic = ctx.createOscillator();
      oscHarmonic.type = 'sine';
      oscHarmonic.frequency.setValueAtTime(f * 2, startTime);

      // Envolvente de volumen (ataque de martillo + decaimiento exponencial)
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(gain, startTime + 0.008);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      const harmGain = ctx.createGain();
      harmGain.gain.setValueAtTime(0.0001, startTime);
      harmGain.gain.exponentialRampToValueAtTime(gain * 0.35, startTime + 0.008);
      harmGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur * 0.6);

      osc.connect(noteGain);
      oscHarmonic.connect(harmGain);

      noteGain.connect(masterGain);
      harmGain.connect(masterGain);

      osc.start(startTime);
      oscHarmonic.start(startTime);
      osc.stop(endTime);
      oscHarmonic.stop(endTime);
    });
  } catch (e) {
    console.warn('[Audio] Fallback sintetizador Web Audio falló:', e);
  }
}

// Sintetizador Web Audio API de respaldo para el sonido especial de Operadora (Efectos Especiales UI Chime)
function sintetizarChimeOperadoraWebAudio() {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // Efecto especial: Triple Chime cristalino moderno (A5 -> E6 -> A6 con brillo armónico)
    const notas = [
      { f: 880.00, delay: 0.00, dur: 0.9, gain: 0.28 },
      { f: 1318.51, delay: 0.11, dur: 1.2, gain: 0.32 },
      { f: 1760.00, delay: 0.20, dur: 1.5, gain: 0.35 }
    ];

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.9, ctx.currentTime);
    masterGain.connect(ctx.destination);

    notas.forEach(({ f, delay, dur, gain }) => {
      const startTime = ctx.currentTime + delay;
      const endTime = startTime + dur;

      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, startTime);

      const oscHigh = ctx.createOscillator();
      oscHigh.type = 'sine';
      oscHigh.frequency.setValueAtTime(f * 2.76, startTime); // Frecuencia inarmónica estilo campana cristalina

      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0.0001, startTime);
      noteGain.gain.exponentialRampToValueAtTime(gain, startTime + 0.002);
      noteGain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      const highGain = ctx.createGain();
      highGain.gain.setValueAtTime(0.0001, startTime);
      highGain.gain.exponentialRampToValueAtTime(gain * 0.4, startTime + 0.002);
      highGain.gain.exponentialRampToValueAtTime(0.0001, startTime + dur * 0.4);

      osc.connect(noteGain);
      oscHigh.connect(highGain);

      noteGain.connect(masterGain);
      highGain.connect(masterGain);

      osc.start(startTime);
      oscHigh.start(startTime);
      osc.stop(endTime);
      oscHigh.stop(endTime);
    });
  } catch (e) {
    console.warn('[Audio] Fallback sintetizador Chime falló:', e);
  }
}

/**
 * Reproduce el sonido especial de notificación para Operadoras de Despacho
 * (Efecto especial de notificación rápida de servicios)
 */
export function reproducirSonidoOperadora() {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio('/sounds/notificacion-operadora.wav');
    audio.volume = 0.95;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Audio Operadora] Reproducción bloqueada por navegador, ejecutando Web Audio API:', err);
        sintetizarChimeOperadoraWebAudio();
      });
    }
  } catch (err) {
    console.warn('[Audio Operadora] Error al instanciar Audio:', err);
    sintetizarChimeOperadoraWebAudio();
  }
}

/**
 * Reproduce el sonido de notificación de Piano Elegante
 */
export function reproducirSonidoNuevoServicio() {
  if (typeof window === 'undefined') return;

  try {
    const audio = new Audio('/sounds/nuevo-servicio.wav');
    audio.volume = 0.9;
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((err) => {
        console.warn('[Audio] Reproducción de archivo bloqueada por el navegador, ejecutando Web Audio API:', err);
        sintetizarPianoEleganteWebAudio();
      });
    }
  } catch (err) {
    console.warn('[Audio] Error al instanciar Audio:', err);
    sintetizarPianoEleganteWebAudio();
  }
}

/**
 * Solicita permisos para Notificaciones Push del Navegador
 */
export async function solicitarPermisoNotificaciones(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    console.warn('[Push] Este navegador no soporta notificaciones de escritorio.');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permiso = await Notification.requestPermission();
    if (permiso === 'granted') {
      try {
        localStorage.setItem('ttm_push_activado', 'true');
      } catch (e) {}
    }
    return permiso;
  } catch (error) {
    console.error('[Push] Error solicitando permiso:', error);
    return 'denied';
  }
}

/**
 * Verifica si las notificaciones push están concedidas actualmente
 */
export function estanNotificacionesActivas(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }
  return Notification.permission === 'granted';
}

/**
 * Dispara la Notificación Push de Navegador y reproduce el sonido de Piano Elegante
 */
export function notificarNuevoServicio(datos: {
  id?: string;
  cliente?: string;
  vehiculo?: string;
  falla?: string;
  direccion?: string;
  monto?: number | string;
}) {
  // 1. Siempre reproducir el tono de Piano Elegante
  reproducirSonidoNuevoServicio();

  // 2. Si el navegador tiene permisos concedidos, emitir notificación push nativa
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const titulo = '🚗 ¡Nuevo Servicio Disponible en TuTallerMóvil!';
      const cuerpo = `${datos.vehiculo ? `Auto: ${datos.vehiculo}\n` : ''}${
        datos.falla ? `Falla: ${datos.falla}\n` : 'Solicitud de diagnóstico in situ\n'
      }📍 ${datos.direccion || 'Caracas'}${datos.monto ? ` • $${datos.monto}` : ''}`;

      const notif = new Notification(titulo, {
        body: cuerpo,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `ttm-servicio-${datos.id || Date.now()}`
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('[Push] Error al emitir Notification nativa:', err);
    }
  }
}

/**
 * Dispara la Notificación Push de Navegador y reproduce el sonido especial de Operadora
 * (Efectos Especiales - New Notification 010)
 */
export function notificarNuevoServicioOperadora(datos: {
  id?: string;
  cliente?: string;
  vehiculo?: string;
  falla?: string;
  direccion?: string;
  monto?: number | string;
}) {
  // 1. Siempre reproducir el sonido especial de Operadora
  reproducirSonidoOperadora();

  // 2. Si el navegador tiene permisos concedidos, emitir notificación push nativa
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      const titulo = '🎧 ¡Nuevo Servicio Entrante en Despacho!';
      const cuerpo = `${datos.cliente ? `Cliente: ${datos.cliente}\n` : ''}${
        datos.vehiculo ? `Vehículo: ${datos.vehiculo}\n` : ''
      }${datos.falla ? `Falla: ${datos.falla}\n` : ''}📍 ${datos.direccion || 'Caracas'}${
        datos.monto ? ` • Estimado: $${datos.monto}` : ''
      }`;

      const notif = new Notification(titulo, {
        body: cuerpo,
        icon: '/icon.svg',
        badge: '/icon.svg',
        tag: `ttm-operadora-${datos.id || Date.now()}`
      });

      notif.onclick = () => {
        window.focus();
        notif.close();
      };
    } catch (err) {
      console.warn('[Push Operadora] Error al emitir Notification nativa:', err);
    }
  }
}
