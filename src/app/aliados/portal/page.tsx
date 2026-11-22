'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import {
  solicitarPermisoNotificaciones,
  estanNotificacionesActivas,
  notificarNuevoServicio,
  reproducirSonidoNuevoServicio
} from '@/lib/notificaciones';
import BotonSoporteWhatsApp from '@/components/BotonSoporteWhatsApp';
import {
  Star,
  Wrench,
  DollarSign,
  Wallet,
  CheckCircle2,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Home as HomeIcon,
  History as HistoryIcon,
  User as UserIcon,
  TrendingUp,
  Radio,
  Bell,
  ArrowLeft,
  Navigation,
  Car,
  Loader2,
  RefreshCw,
  Inbox,
  LocateFixed,
  LogOut,
  Sparkles,
  Check,
  ClipboardCheck,
  ExternalLink,
  Phone,
  Plus,
  ChevronRight,
  Lock,
  ShieldAlert,
  AlertTriangle,
  X,
  Camera,
  Edit3,
  Upload,
  Image as ImageIcon
} from 'lucide-react';
import { cerrarSesion } from '@/lib/auth';
import OnboardingModal from '@/components/ui/onboarding-modal';

type EstadoMecanico = 'DISPONIBLE' | 'EN_SERVICIO' | 'INACTIVO';

interface OrdenSupabase {
  id: string;
  cliente_nombre: string;
  vehiculo_marca?: string | null;
  vehiculo_modelo: string;
  vehiculo_anio?: number | string | null;
  falla_reportada: string;
  sector: string;
  ganancia_estimada: number | string;
  estado: string;
  mecanico_id?: string | null;
  foto_odometro_url?: string | null;
  latitud?: number | string | null;
  longitud?: number | string | null;
  created_at?: string;
}

// 2. Función con fórmula de Haversine para calcular distancia en km
function calcularDistanciaKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PortalAliadosPage() {
  const [estado, setEstado] = useState<EstadoMecanico>('DISPONIBLE');
  const [activeTab, setActiveTab] = useState<'inicio' | 'historial' | 'billetera' | 'perfil'>('inicio');

  // Órdenes reales desde Supabase
  const [ordenes, setOrdenes] = useState<OrdenSupabase[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [aceptandoId, setAceptandoId] = useState<string | null>(null);
  const [mostrarTutorial, setMostrarTutorial] = useState<boolean>(false);
  const [mostrarBotonTutorial, setMostrarBotonTutorial] = useState<boolean>(false);
  // Por requerimiento: por defecto solo mostrar solicitudes disponibles no asignadas
  const [filtroServicios, setFiltroServicios] = useState<'disponibles' | 'asignados'>('disponibles');
  const [toastAceptado, setToastAceptado] = useState<string | null>(null);
  const [modalBloqueoOrden, setModalBloqueoOrden] = useState<boolean>(false);
  const [finalizandoId, setFinalizandoId] = useState<string | null>(null);
  const [mecanicoId, setMecanicoId] = useState<string>('');

  // Sincronizar pestañas desde el MobileBottomNav global PWA
  useEffect(() => {
    const handleSwitchTab = (e: any) => {
      const tab = e.detail;
      if (tab === 'servicios' || tab === 'feed') setActiveTab('inicio');
      else if (tab === 'billetera') setActiveTab('billetera');
      else if (tab === 'perfil') {
        setActiveTab('perfil');
        handleAbrirEditarPerfil();
      }
    };
    window.addEventListener('ttm:switch-tab', handleSwitchTab);
    return () => window.removeEventListener('ttm:switch-tab', handleSwitchTab);
  }, []);
  const [codigoAliado, setCodigoAliado] = useState<string>('#TTM-5385');
  const [nombreMecanico, setNombreMecanico] = useState<string>('jose antonio');
  const [fotoPerfil, setFotoPerfil] = useState<string>('https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=600&q=80');
  const [especialidadMecanico, setEspecialidadMecanico] = useState<string>('Mecánica General & Inyección');
  const [telefonoMecanico, setTelefonoMecanico] = useState<string>('+58 412 123 4567');
  const [zonaCobertura, setZonaCobertura] = useState<string>('Gran Caracas');

  // Modales de Edición de Perfil y Cámara
  const [modalEditarPerfilOpen, setModalEditarPerfilOpen] = useState<boolean>(false);
  const [modalCamaraWebOpen, setModalCamaraWebOpen] = useState<boolean>(false);
  const [camaraIniciada, setCamaraIniciada] = useState<boolean>(false);

  // Estados de Formulario de Perfil
  const [formNombre, setFormNombre] = useState<string>('jose antonio');
  const [formEspecialidad, setFormEspecialidad] = useState<string>('Mecánica General & Inyección');
  const [formTelefono, setFormTelefono] = useState<string>('+58 412 123 4567');
  const [formZona, setFormZona] = useState<string>('Gran Caracas');
  const [formFotoPreview, setFormFotoPreview] = useState<string>('');

  // Refs de archivos y cámara
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamCamaraRef = useRef<MediaStream | null>(null);

  // Notificaciones Push y Alertas Sonoras (Piano Elegante)
  const [pushActivo, setPushActivo] = useState<boolean>(false);
  const [toastPush, setToastPush] = useState<string | null>(null);
  const ordenesIdsConocidasRef = React.useRef<Set<string>>(new Set());
  const esPrimeraCargaRef = React.useRef<boolean>(true);

  useEffect(() => {
    setPushActivo(estanNotificacionesActivas());
  }, []);

  const handleToggleNotificaciones = async () => {
    const permiso = await solicitarPermisoNotificaciones();
    if (permiso === 'granted') {
      setPushActivo(true);
      // Prueba inmediata para que el usuario verifique el tono de piano y la notificación
      notificarNuevoServicio({
        id: 'test',
        cliente: 'Prueba de Alerta Sonora',
        vehiculo: 'Tono Piano Elegante Activo',
        falla: 'Notificaciones Push configuradas correctamente',
        direccion: 'Caracas'
      });
      setToastPush('🔔 Notificaciones push activadas con el tono de piano elegante');
      setTimeout(() => setToastPush(null), 4500);
    } else {
      // Reproducir sonido de prueba de todas formas
      reproducirSonidoNuevoServicio();
      setToastPush('⚠️ Permiso push bloqueado en el navegador. (Sonido de prueba ejecutado)');
      setTimeout(() => setToastPush(null), 4500);
    }
  };

  // 1. Geolocalización del mecánico
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [gpsActivo, setGpsActivo] = useState<boolean>(false);

  // Obtener geolocalización y cargar perfil al montar el componente
  useEffect(() => {
    // Obtener sesión real del usuario autenticado
    const supabaseClient = createClient();
    supabaseClient.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setMecanicoId(user.id);
      }
    }).catch(() => { });

    if (typeof window !== 'undefined') {
      // Cargar foto guardada
      const fotoGuardada = localStorage.getItem('ttm_aliado_foto');
      if (fotoGuardada) {
        setFotoPerfil(fotoGuardada);
      }

      // Cargar campos guardados
      const nombreGuardado = localStorage.getItem('ttm_aliado_nombre');
      if (nombreGuardado) setNombreMecanico(nombreGuardado);

      const espGuardada = localStorage.getItem('ttm_aliado_especialidad');
      if (espGuardada) setEspecialidadMecanico(espGuardada);

      const telGuardado = localStorage.getItem('ttm_aliado_telefono');
      if (telGuardado) setTelefonoMecanico(telGuardado);

      const zonaGuardada = localStorage.getItem('ttm_aliado_zona');
      if (zonaGuardada) setZonaCobertura(zonaGuardada);

      const matchCode = document.cookie.match(/(^| )ttm_user_code=([^;]+)/);
      if (matchCode && matchCode[2]) {
        const val = decodeURIComponent(matchCode[2]);
        if (val.startsWith('#') || val.startsWith('TTM-')) {
          setCodigoAliado(val.startsWith('#') ? val : `#${val}`);
        }
      }
      const rawSesion = localStorage.getItem('ttm_aliado_sesion');
      if (rawSesion) {
        try {
          const parsed = JSON.parse(rawSesion);
          if (parsed.codigo_aliado) setCodigoAliado(parsed.codigo_aliado);
          if (parsed.nombre) setNombreMecanico(parsed.nombre);
          if (parsed.foto) setFotoPerfil(parsed.foto);
          if (parsed.especialidad) setEspecialidadMecanico(parsed.especialidad);
          if (parsed.telefono) setTelefonoMecanico(parsed.telefono);
          if (parsed.zona) setZonaCobertura(parsed.zona);
        } catch (e) { }
      }

      const estaRegistrado = typeof document !== 'undefined' && Boolean(
        document.cookie.match(/(^| )ttm_user_code=([^;]+)/) ||
        document.cookie.match(/(^| )ttm_role=([^;]+)/)
      );
      const visto = localStorage.getItem('onboarding_seen_mecanico');
      if (estaRegistrado || visto) {
        setMostrarBotonTutorial(false);
      } else {
        setMostrarBotonTutorial(true);
      }
    }

    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setGpsActivo(true);
        },
        (error) => {
          console.warn('GPS no disponible o denegado por el usuario:', error.message);
          setGpsActivo(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, []);

  // Consulta a Supabase para traer todas las órdenes del sistema
  const cargarOrdenes = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setCargando(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('ordenes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error consultando tabla ordenes:', error);
      } else if (data) {
        setOrdenes(data);

        // Detectar si llegaron órdenes nuevas para disparar sonido de piano y notificación
        if (!esPrimeraCargaRef.current) {
          const nuevas = data.filter(
            (o) =>
              !ordenesIdsConocidasRef.current.has(o.id) &&
              (o.estado === 'DISPONIBLE' || o.estado === 'LEAD_NUEVO')
          );
          if (nuevas.length > 0) {
            const ord = nuevas[0];
            notificarNuevoServicio({
              id: ord.id,
              cliente: ord.cliente_nombre,
              vehiculo: ord.marca_modelo,
              falla: ord.falla_reportada,
              direccion: ord.direccion_texto,
              monto: ord.monto_total
            });
          }
        }

        // Registrar IDs conocidos
        data.forEach((o) => ordenesIdsConocidasRef.current.add(o.id));
        esPrimeraCargaRef.current = false;
      }
    } catch (err) {
      console.error('Excepción al cargar ordenes:', err);
    } finally {
      setCargando(false);
      setRefreshing(false);
    }
  };

  // 2. Cargar órdenes iniciales y activar Supabase Realtime para cualquier cambio en ordenes
  useEffect(() => {
    cargarOrdenes();

    const supabase = createClient();
    const channel = supabase
      .channel('realtime_ordenes_aliados_all')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ordenes'
        },
        (payload: any) => {
          console.log('⚡ Orden modificada/creada en tiempo real:', payload);
          if (
            payload.eventType === 'INSERT' ||
            (payload.new && (payload.new.estado === 'DISPONIBLE' || payload.new.estado === 'LEAD_NUEVO'))
          ) {
            const ord = payload.new;
            if (ord && !ordenesIdsConocidasRef.current.has(ord.id)) {
              notificarNuevoServicio({
                id: ord.id,
                cliente: ord.cliente_nombre,
                vehiculo: ord.marca_modelo,
                falla: ord.falla_reportada,
                direccion: ord.direccion_texto,
                monto: ord.monto_total
              });
            }
          }
          cargarOrdenes();
        }
      )
      .subscribe((status, err) => {
        console.log('📡 Estado de suscripción Supabase Realtime:', status, err || '');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // 3. Ordenar por cercanía (Haversine) si hay coordenadas del usuario
  const ordenesConDistancia = useMemo(() => {
    return ordenes
      .map((orden) => {
        let distanciaKm: number | null = null;
        if (
          userCoords &&
          orden.latitud !== null &&
          orden.latitud !== undefined &&
          orden.longitud !== null &&
          orden.longitud !== undefined
        ) {
          const latOrd = Number(orden.latitud);
          const lonOrd = Number(orden.longitud);
          if (!isNaN(latOrd) && !isNaN(lonOrd)) {
            distanciaKm = calcularDistanciaKm(
              userCoords.latitude,
              userCoords.longitude,
              latOrd,
              lonOrd
            );
          }
        }
        return {
          ...orden,
          distanciaKm
        };
      })
      .sort((a, b) => {
        // Si ambos tienen distancia, ordenar el más cercano primero
        if (a.distanciaKm !== null && b.distanciaKm !== null) {
          return a.distanciaKm - b.distanciaKm;
        }
        // Los que tienen distancia van antes de los que no tienen
        if (a.distanciaKm !== null) return -1;
        if (b.distanciaKm !== null) return 1;
        return 0;
      });
  }, [ordenes, userCoords]);

  // Clasificación de órdenes
  const ordenesAsignadas = useMemo(() => {
    return ordenesConDistancia.filter((o) =>
      ((mecanicoId && o.mecanico_id === mecanicoId) ||
        (codigoAliado && o.mecanico_id === codigoAliado) ||
        ['ASIGNADO', 'REPUESTOS_EN_RUTA', 'EN_EJECUCION', 'PENDIENTE_PAGO', 'LIQUIDACION_PENDIENTE'].includes(o.estado)) &&
      !['FINALIZADO', 'CANCELADO'].includes(o.estado)
    );
  }, [ordenesConDistancia, mecanicoId, codigoAliado]);

  // REGLA DE NEGOCIO P0: El mecánico solo puede tomar UNA orden por vez hasta terminarla
  const ordenActivaEnCurso = useMemo(() => {
    return ordenesAsignadas.find((o) =>
      ['ASIGNADO', 'REPUESTOS_EN_RUTA', 'EN_EJECUCION', 'PENDIENTE_PAGO', 'LIQUIDACION_PENDIENTE'].includes(o.estado)
    );
  }, [ordenesAsignadas]);

  const tieneOrdenActiva = Boolean(ordenActivaEnCurso);

  // Estados que indican que la orden ya avanzó en el pipeline
  const ESTADOS_AVANZADOS = useMemo(() => [
    'ASIGNADO',
    'EN_INSPECCION',
    'COTIZACION_PENDIENTE',
    'REPUESTOS_EN_RUTA',
    'EN_EJECUCION',
    'PENDIENTE_PAGO',
    'PAGO_REPORTADO',
    'PAGADO',
    'LIQUIDACION_PENDIENTE',
    'FINALIZADO',
    'CANCELADO'
  ], []);

  // Estados iniciales libres que pueden ser tomados
  const ESTADOS_INICIALES = useMemo(() => [
    'DISPONIBLE',
    'LEAD_NUEVO',
    'DIAGNOSTICO_AGENDADO'
  ], []);

  // REGLA SOLICITADA: En este apartado solo tienen que salir las órdenes sin mecánico asignado y no avanzadas
  const ordenesDisponibles = useMemo(() => {
    return ordenesConDistancia.filter((o) => {
      const sinMecanico = !o.mecanico_id || String(o.mecanico_id).trim() === '';
      const noAvanzada = !ESTADOS_AVANZADOS.includes(o.estado);
      const esEstadoInicial = ESTADOS_INICIALES.includes(o.estado) || !o.estado;
      return sinMecanico && noAvanzada && esEstadoInicial;
    });
  }, [ordenesConDistancia, ESTADOS_AVANZADOS, ESTADOS_INICIALES]);

  const ordenesFiltradas = useMemo(() => {
    if (filtroServicios === 'asignados') return ordenesAsignadas;
    return ordenesDisponibles;
  }, [filtroServicios, ordenesAsignadas, ordenesDisponibles]);

  // Abrir modal de edición con los datos actuales
  const handleAbrirEditarPerfil = () => {
    setFormNombre(nombreMecanico);
    setFormEspecialidad(especialidadMecanico);
    setFormTelefono(telefonoMecanico);
    setFormZona(zonaCobertura);
    setFormFotoPreview(fotoPerfil);
    setModalEditarPerfilOpen(true);
  };

  // Guardar cambios del perfil
  const handleGuardarPerfil = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nuevoNombre = formNombre.trim() || nombreMecanico;
    const nuevaEsp = formEspecialidad.trim() || especialidadMecanico;
    const nuevoTel = formTelefono.trim() || telefonoMecanico;
    const nuevaZona = formZona.trim() || zonaCobertura;
    const nuevaFoto = formFotoPreview || fotoPerfil;

    setNombreMecanico(nuevoNombre);
    setEspecialidadMecanico(nuevaEsp);
    setTelefonoMecanico(nuevoTel);
    setZonaCobertura(nuevaZona);
    setFotoPerfil(nuevaFoto);

    if (typeof window !== 'undefined') {
      localStorage.setItem('ttm_aliado_nombre', nuevoNombre);
      localStorage.setItem('ttm_aliado_especialidad', nuevaEsp);
      localStorage.setItem('ttm_aliado_telefono', nuevoTel);
      localStorage.setItem('ttm_aliado_zona', nuevaZona);
      localStorage.setItem('ttm_aliado_foto', nuevaFoto);

      const sesionActual = {
        codigo_aliado: codigoAliado,
        nombre: nuevoNombre,
        especialidad: nuevaEsp,
        telefono: nuevoTel,
        zona: nuevaZona,
        foto: nuevaFoto
      };
      localStorage.setItem('ttm_aliado_sesion', JSON.stringify(sesionActual));
      document.cookie = `ttm_user_name=${encodeURIComponent(nuevoNombre)}; path=/; max-age=31536000`;
    }

    setModalEditarPerfilOpen(false);
    setToastAceptado('✓ Perfil y credenciales actualizados exitosamente');
    setTimeout(() => setToastAceptado(null), 4000);
  };

  // Cargar archivo desde el dispositivo (Galería / Archivos)
  const handleFotoArchivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        setFormFotoPreview(result);
        setFotoPerfil(result);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ttm_aliado_foto', result);
        }
        setToastAceptado('✓ Foto de perfil cargada desde el dispositivo');
        setTimeout(() => setToastAceptado(null), 3500);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Iniciar cámara en vivo (webcam o cámara de dispositivo)
  const handleIniciarCamaraWeb = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
          audio: false
        });
        streamCamaraRef.current = stream;
        setModalCamaraWebOpen(true);
        setCamaraIniciada(true);
        setTimeout(() => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play().catch(console.error);
          }
        }, 100);
      } else {
        cameraInputRef.current?.click();
      }
    } catch (err: any) {
      console.warn('Cámara no accesible vía getUserMedia, usando fallback nativo:', err);
      cameraInputRef.current?.click();
    }
  };

  // Tomar fotografía desde el feed de video
  const handleCapturarFotoWeb = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    setFormFotoPreview(dataUrl);
    setFotoPerfil(dataUrl);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ttm_aliado_foto', dataUrl);
    }

    handleCerrarCamaraWeb();
    setToastAceptado('✓ Fotografía capturada con éxito');
    setTimeout(() => setToastAceptado(null), 3500);
  };

  // Cerrar cámara y detener streams
  const handleCerrarCamaraWeb = () => {
    if (streamCamaraRef.current) {
      streamCamaraRef.current.getTracks().forEach((track) => track.stop());
      streamCamaraRef.current = null;
    }
    setCamaraIniciada(false);
    setModalCamaraWebOpen(false);
  };

  // Acción para Finalizar y Completar un Servicio (Liberando el cupo del mecánico)
  const handleFinalizarServicio = async (ordenId: string) => {
    if (finalizandoId) return;
    setFinalizandoId(ordenId);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('ordenes')
        .update({ estado: 'FINALIZADO' })
        .eq('id', ordenId);

      if (!error) {
        setToastAceptado('✓ Servicio completado y marcado como FINALIZADO. Ya puedes tomar una nueva orden.');
        setTimeout(() => setToastAceptado(null), 4500);
        setModalBloqueoOrden(false);
        setOrdenes((prev) =>
          prev.map((o) => (o.id === ordenId ? { ...o, estado: 'FINALIZADO' } : o))
        );
        await cargarOrdenes(true);
      } else {
        alert('Error al finalizar el servicio: ' + error.message);
      }
    } catch (e) {
      console.error(e);
      alert('Error de conexión al finalizar el servicio');
    } finally {
      setFinalizandoId(null);
    }
  };

  // 4 y 5. Acción de Aceptar con Supabase RPC y manejo de Race Conditions
  const handleAceptarServicio = async (orden: OrdenSupabase) => {
    // REGLA P0: El mecánico solo puede tomar UNA orden por vez hasta terminarla
    if (tieneOrdenActiva) {
      setModalBloqueoOrden(true);
      return;
    }

    if (aceptandoId) return;
    setAceptandoId(orden.id);

    try {
      const supabase = createClient();
      const idMecanicoAsignar = mecanicoId || codigoAliado || 'mecanico_autenticado';

      const { data, error } = await supabase.rpc('aceptar_servicio_disponible', {
        p_orden_id: orden.id,
        p_mecanico_id: idMecanicoAsignar
      });

      if (data === true) {
        setToastAceptado(`¡Servicio aceptado! La orden se añadió a tus servicios asignados.`);
        setTimeout(() => setToastAceptado(null), 4500);
        // Actualizar localmente para feedback inmediato
        setOrdenes((prev) =>
          prev.map((o) =>
            o.id === orden.id
              ? { ...o, estado: 'ASIGNADO', mecanico_id: idMecanicoAsignar }
              : o
          )
        );
        setFiltroServicios('asignados');
      } else {
        // Fallback directo por update en base de datos si la orden está en estado diferente a DISPONIBLE
        const { error: updErr } = await supabase
          .from('ordenes')
          .update({
            estado: 'ASIGNADO',
            mecanico_id: idMecanicoAsignar
          })
          .eq('id', orden.id);

        if (!updErr) {
          setToastAceptado(`¡Servicio asignado a tu perfil con éxito!`);
          setTimeout(() => setToastAceptado(null), 4500);
          await cargarOrdenes(true);
          setFiltroServicios('asignados');
        } else {
          alert('Lo sentimos, otro mecánico acaba de aceptar este servicio');
          await cargarOrdenes(true);
        }
      }
    } catch (err) {
      console.error('Excepción al aceptar servicio:', err);
      alert('Ocurrió un inconveniente al aceptar el servicio. Intenta nuevamente.');
    } finally {
      setAceptandoId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0A1525] flex flex-col font-sans pb-28 md:pb-12 selection:bg-[#CCFF00] selection:text-[#0A1525]">

      {/* Barra Superior */}
      <header className="bg-white border-b border-[#CBD5E1] sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-lg border border-[#CBD5E1] flex items-center justify-center text-slate-500 hover:text-[#0A1525] hover:bg-slate-50 transition-colors"
              title="Volver a la Landing"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <img src="/icon.svg" alt="TuTallerMóvil" className="h-10 w-auto object-contain" />
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#1E56B0]/10 text-[#1E56B0] px-2 py-0.5 rounded">
                  Portal Aliados
                </span>
                <span className="px-2 py-0.5 rounded-md bg-[#0A1525] text-[#CCFF00] font-mono text-[10px] font-black shadow-2xs border border-slate-800">
                  {codigoAliado}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BotonSoporteWhatsApp
              modo="header"
              mensaje="Hola, soy mecánico aliado de TuTallerMóvil y necesito soporte de la Torre de Despacho"
              className="hidden sm:inline-flex"
            />
            <button
              type="button"
              onClick={() => cargarOrdenes(true)}
              disabled={refreshing}
              className="p-2 rounded-lg border border-[#CBD5E1] text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
              title="Actualizar Órdenes"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#1E56B0]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={handleToggleNotificaciones}
              className={`relative p-2 rounded-lg border transition-all cursor-pointer ${pushActivo
                ? 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 shadow-2xs'
                : 'border-[#CBD5E1] text-slate-600 hover:bg-slate-50'
                }`}
              title={
                pushActivo
                  ? 'Notificaciones Push y Sonido Piano Elegante Activos (Clic para probar)'
                  : 'Activar Notificaciones Push con Sonido de Piano Elegante'
              }
            >
              <Bell className={`w-4 h-4 ${pushActivo ? 'text-emerald-600' : ''}`} />
              <span
                className={`absolute top-1 right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white transition-all ${pushActivo ? 'bg-emerald-500 animate-pulse' : 'bg-[#CCFF00]'
                  }`}
              ></span>
            </button>

            {mostrarBotonTutorial && (
              <button
                type="button"
                onClick={() => setMostrarTutorial(true)}
                className="p-2 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-[#1E56B0] transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Ver tutorial de bienvenida (Solo primera visita)"
              >
                <Sparkles className="w-4 h-4 text-[#1E56B0]" />
                <span className="hidden sm:inline">Tutorial</span>
              </button>
            )}

            <button
              type="button"
              onClick={cerrarSesion}
              className="p-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 w-full space-y-6">

        {/* 1. Header del Perfil */}
        <section className="bg-white border border-[#CBD5E1] rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 text-center sm:text-left">

            {/* Avatar y Datos Personales */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="relative group">
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl bg-[#0A1525] border-2 border-[#CBD5E1] p-1 overflow-hidden flex items-center justify-center text-white shadow-md relative">
                  <img
                    src={fotoPerfil}
                    alt={`${nombreMecanico} - Especialista TuTallerMóvil`}
                    className="w-full h-full rounded-xl object-cover object-center"
                  />
                  {/* Overlay hover para cambiar foto */}
                  <button
                    type="button"
                    onClick={handleAbrirEditarPerfil}
                    className="absolute inset-0 bg-black/40 backdrop-blur-2xs opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-[10px] font-bold cursor-pointer"
                    title="Cambiar Foto"
                  >
                    <Camera className="w-5 h-5 text-[#CCFF00] mb-0.5" />
                    <span>Cambiar</span>
                  </button>
                </div>

                {/* Botón rápido de cámara en la esquina inferior del avatar */}
                <button
                  type="button"
                  onClick={handleAbrirEditarPerfil}
                  className="absolute -bottom-1 -left-1 w-7 h-7 rounded-full bg-[#0A1525] text-white hover:bg-[#1E56B0] border-2 border-white flex items-center justify-center shadow-md transition-all cursor-pointer active:scale-95"
                  title="Cambiar foto de perfil"
                >
                  <Camera className="w-3.5 h-3.5 text-[#CCFF00]" />
                </button>

                {/* Indicador de estado en el avatar */}
                <span
                  className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${estado === 'DISPONIBLE'
                    ? 'bg-[#CCFF00]'
                    : estado === 'EN_SERVICIO'
                      ? 'bg-[#1E56B0]'
                      : 'bg-slate-400'
                    }`}
                ></span>
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A1525] tracking-tight">
                    {nombreMecanico}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#0A1525] text-[#CCFF00] font-mono text-xs font-black shadow-2xs border border-slate-800 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#CCFF00]" />
                    {codigoAliado}
                  </span>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verificado
                  </span>

                  {/* Botón Editar Perfil */}
                  <button
                    type="button"
                    onClick={handleAbrirEditarPerfil}
                    className="h-7 px-2.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title="Editar perfil y foto"
                  >
                    <Edit3 className="w-3 h-3 text-[#1E56B0]" />
                    <span>Editar Perfil</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs text-slate-500 font-medium">
                  <span className="font-mono font-bold text-[#1E56B0] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                    {codigoAliado}
                  </span>
                  <span>•</span>
                  <span>{especialidadMecanico}</span>
                  <span>•</span>
                  <span>{telefonoMecanico}</span>
                </div>

                {/* Calificación 4.9 estrellas */}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 stroke-amber-400" />
                  </div>
                  <span className="text-xs font-black text-[#0A1525]">4.9</span>
                  <span className="text-[11px] text-slate-400 font-normal">(118 reseñas)</span>
                </div>
              </div>
            </div>

            {/* Zona de Cobertura & GPS State */}
            <div className="flex sm:flex-col items-center sm:items-end justify-center gap-1.5 text-xs text-slate-500 bg-[#F8FAFC] border border-[#CBD5E1] p-3 rounded-xl sm:min-w-[170px]">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                Zona de Cobertura
              </span>
              <span className="font-bold text-[#0A1525] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#1E56B0]" /> {zonaCobertura}
              </span>
              <span className={`text-[10px] font-semibold flex items-center gap-1 ${gpsActivo ? 'text-emerald-700' : 'text-slate-400'}`}>
                <LocateFixed className="w-3 h-3" />
                {gpsActivo ? 'GPS activo • Cercanía' : 'GPS no detectado'}
              </span>
            </div>

          </div>
        </section>

        {/* 2. Conmutador de Estado (3 Estados) */}
        <section className="bg-white border border-[#CBD5E1] rounded-2xl p-2.5 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-1">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Estado Operativo:
              </span>
            </div>

            {/* Botones de Selección */}
            <div className="grid grid-cols-3 gap-1.5 w-full sm:w-auto bg-[#F8FAFC] p-1 rounded-xl border border-[#CBD5E1]">

              {/* DISPONIBLE */}
              <button
                type="button"
                onClick={() => setEstado('DISPONIBLE')}
                className={`h-11 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${estado === 'DISPONIBLE'
                  ? 'bg-[#CCFF00] text-[#0A1525] shadow-xs'
                  : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${estado === 'DISPONIBLE' ? 'bg-[#0A1525] animate-ping' : 'bg-slate-300'}`}></span>
                <span>DISPONIBLE</span>
              </button>

              {/* EN SERVICIO */}
              <button
                type="button"
                onClick={() => setEstado('EN_SERVICIO')}
                className={`h-11 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${estado === 'EN_SERVICIO'
                  ? 'bg-[#1E56B0] text-white shadow-xs'
                  : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
              >
                <span className={`w-2 h-2 rounded-full ${estado === 'EN_SERVICIO' ? 'bg-[#CCFF00]' : 'bg-slate-300'}`}></span>
                <span>EN SERVICIO</span>
              </button>

              {/* INACTIVO */}
              <button
                type="button"
                onClick={() => setEstado('INACTIVO')}
                className={`h-11 px-4 text-xs font-extrabold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${estado === 'INACTIVO'
                  ? 'bg-slate-500 text-white shadow-xs'
                  : 'text-slate-500 hover:text-[#0A1525]'
                  }`}
              >
                <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                <span>INACTIVO</span>
              </button>

            </div>
          </div>
        </section>

        {/* Banner Destacado: Servicio Activo en Ejecución (Regla: 1 Orden por Vez) */}
        {(tieneOrdenActiva && ordenActivaEnCurso) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0A1525] text-white rounded-2xl p-4 sm:p-5 border-2 border-[#CCFF00] shadow-md flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
          >
            <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
              <div className="w-12 h-12 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center font-black shrink-0 shadow-sm">
                <Wrench className="w-6 h-6 text-[#0A1525]" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-ping"></span>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#CCFF00]">
                    1 Orden Activa por Vez • {ordenActivaEnCurso.estado}
                  </span>
                  <span className="text-[10px] font-mono font-bold bg-white/10 text-slate-200 px-2 py-0.5 rounded">
                    #{ordenActivaEnCurso.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-base font-black text-white truncate">
                  {[ordenActivaEnCurso.vehiculo_marca, ordenActivaEnCurso.vehiculo_modelo, ordenActivaEnCurso.vehiculo_anio]
                    .filter(Boolean)
                    .join(' ') || ordenActivaEnCurso.vehiculo_modelo || 'Vehículo en Atención'}
                </h3>
                <p className="text-xs text-slate-300 line-clamp-1">
                  Cliente: <strong className="text-white">{ordenActivaEnCurso.cliente_nombre}</strong> • Falla: {ordenActivaEnCurso.falla_reportada}
                </p>
                <p className="text-[11px] text-amber-300 font-semibold flex items-center gap-1 pt-0.5">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>Por política SLA, debes finalizar este servicio para poder tomar una nueva orden de la bolsa.</span>
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto shrink-0 justify-end pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
              <Link
                href={`/aliados/servicio/${ordenActivaEnCurso.id}`}
                className="flex-1 sm:flex-initial h-11 px-4 rounded-xl bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95"
              >
                <ClipboardCheck className="w-4 h-4 text-[#0A1525]" />
                <span>Ejecutar Servicio</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <button
                type="button"
                disabled={finalizandoId === ordenActivaEnCurso.id}
                onClick={() => handleFinalizarServicio(ordenActivaEnCurso.id)}
                className="h-11 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                title="Completar y finalizar servicio para poder tomar una nueva orden"
              >
                {finalizandoId === ordenActivaEnCurso.id ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <Check className="w-4 h-4 stroke-[3]" />
                )}
                <span>Finalizar Servicio</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* 3. Tablero de Rendimiento (KPIs) */}
        <section>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

            {/* KPI 1: Servicios Realizados */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Servicios
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  124
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  +12 este mes
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                <Wrench className="w-5 h-5 text-[#1E56B0]" />
              </div>
            </motion.div>

            {/* KPI 2: Dinero Acumulado */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Acumulado
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  $1,450
                </span>
                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">
                  Total generado
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-[#1E56B0]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </motion.div>

            {/* KPI 3: Saldo Disponible */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Saldo Disponible
                </span>
                <span className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
                  $350
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Listo para retiro
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Wallet className="w-5 h-5" />
              </div>
            </motion.div>

            {/* KPI 4: Calificación */}
            <motion.div
              whileHover={{ y: -2 }}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between"
            >
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Calificación
                </span>
                <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                  4.95
                </span>
                <span className="text-[10px] text-amber-600 font-semibold block mt-0.5">
                  Top 5% Caracas
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
            </motion.div>

          </div>
        </section>

        {/* 4. Feed de Servicios (Conectado a la tabla ordenes en Supabase) */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[#0A1525]">
                Bolsa de Servicios Disponibles
              </h2>
              {!cargando && (
                <span className="bg-[#CCFF00] text-[#0A1525] font-extrabold text-xs px-2.5 py-0.5 rounded-full">
                  {ordenesFiltradas.length} {filtroServicios === 'asignados' ? 'en curso' : 'disponibles'}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5 font-medium bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Supabase Realtime
              </span>
            </div>
          </div>

          {/* Filtros de Pestañas: Solicitudes Disponibles (Default) y Mis Servicios Asignados */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setFiltroServicios('disponibles')}
              className={`h-9 px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${filtroServicios === 'disponibles'
                ? 'bg-[#0A1525] text-[#CCFF00] shadow-xs'
                : 'bg-white text-slate-600 border border-[#CBD5E1] hover:bg-slate-50'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span>Solicitudes Disponibles (Sin Asignar)</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${filtroServicios === 'disponibles' ? 'bg-[#CCFF00] text-[#0A1525]' : 'bg-emerald-50 text-emerald-700'
                }`}>
                {ordenesDisponibles.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroServicios('asignados')}
              className={`h-9 px-3.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${filtroServicios === 'asignados'
                ? 'bg-[#1E56B0] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-[#CBD5E1] hover:bg-slate-50'
                }`}
            >
              <ClipboardCheck className="w-3.5 h-3.5" />
              <span>Mis Servicios Asignados</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-mono ${filtroServicios === 'asignados' ? 'bg-white/20 text-[#CCFF00]' : 'bg-blue-50 text-[#1E56B0]'
                }`}>
                {ordenesAsignadas.length}
              </span>
            </button>
          </div>

          {/* Estado Inactivo */}
          {estado === 'INACTIVO' ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <Radio className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-[#0A1525]">Estás en modo INACTIVO</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cambia tu estado a <strong className="text-emerald-700">DISPONIBLE</strong> en la parte superior para recibir solicitudes y despachos en tu zona.
              </p>
              <button
                type="button"
                onClick={() => setEstado('DISPONIBLE')}
                className="h-10 px-4 bg-[#CCFF00] text-[#0A1525] font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Activar Disponibilidad
              </button>
            </div>
          ) : cargando ? (
            /* Estado de Carga */
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-12 text-center space-y-3 shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#1E56B0] mx-auto" />
              <p className="text-sm font-semibold text-slate-600">
                Consultando órdenes en Supabase...
              </p>
            </div>
          ) : ordenesFiltradas.length === 0 ? (
            /* 5. Mensaje Vacío si no hay órdenes en este filtro */
            <div className="bg-white border border-[#CBD5E1] rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="relative w-16 h-16 rounded-3xl bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400 shadow-2xs">
                <Inbox className="w-8 h-8 stroke-[1.8] text-slate-400" />
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-black text-[#0A1525]">
                  {ordenesFiltradas.length === 0
                    ? 'Tu portal está listo. Aquí aparecerán los servicios'
                    : (filtroServicios === 'asignados' ? 'Sin servicios asignados' : 'Sin solicitudes disponibles')}
                </h3>
                <p className="text-xs sm:text-sm text-[#475569] font-medium max-w-sm mx-auto">
                  {filtroServicios === 'asignados'
                    ? 'Cuando aceptes una solicitud de la bolsa o la central te asigne una orden, la gestionarás desde aquí.'
                    : 'En esta sección se listan las solicitudes en tiempo real en tu zona de Caracas. Mantén tu GPS y sonido activos.'}
                </p>
              </div>
            </div>
          ) : (
            /* Feed de Servicios con Datos Reales y Ordenados por Distancia */
            <div className="space-y-4">
              {ordenesFiltradas.map((orden, index) => {
                const gananciaFormatted = `$${Number(orden.ganancia_estimada || 0).toFixed(2)} USD`;
                const shortId = orden.id ? `#${orden.id.slice(0, 8).toUpperCase()}` : `#ORD-${index + 1}`;
                const isAccepting = aceptandoId === orden.id;
                const vehiculoCompleto = [orden.vehiculo_marca, orden.vehiculo_modelo, orden.vehiculo_anio]
                  .filter(Boolean)
                  .join(' ') || orden.vehiculo_modelo || 'Vehículo';

                const estaAsignado =
                  (mecanicoId && orden.mecanico_id === mecanicoId) ||
                  (codigoAliado && orden.mecanico_id === codigoAliado) ||
                  ['ASIGNADO', 'REPUESTOS_EN_RUTA', 'EN_EJECUCION', 'PENDIENTE_PAGO'].includes(orden.estado);

                return (
                  <motion.div
                    key={orden.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-20px' }}
                    transition={{ duration: 0.35, delay: index * 0.05, ease: 'easeOut' }}
                    whileHover={{ scale: 1.008 }}
                    className={`bg-white border-2 rounded-2xl p-5 sm:p-6 shadow-sm transition-all ${estaAsignado
                      ? 'border-[#1E56B0]/40 hover:border-[#1E56B0] shadow-blue-50/50'
                      : 'border-[#CBD5E1] hover:border-[#0A1525]'
                      }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                      {/* Datos de la Orden (Falla, Modelo, Sector, Distancia) */}
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                            {shortId}
                          </span>

                          {estaAsignado ? (
                            <span className="text-[10px] font-black uppercase tracking-wider bg-blue-50 text-[#1E56B0] border border-blue-200 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#1E56B0] animate-pulse"></span>
                              {orden.estado === 'EN_EJECUCION' ? 'EN EJECUCIÓN' : 'ASIGNADO A TI'}
                            </span>
                          ) : (
                            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              {orden.estado}
                            </span>
                          )}

                          {/* Distancia Calculada con Haversine (si GPS concedido y orden tiene coords) */}
                          {orden.distanciaKm !== null && (
                            <span className="inline-flex items-center gap-1 bg-[#1E56B0]/10 text-[#1E56B0] border border-[#1E56B0]/20 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                              <Navigation className="w-3 h-3 text-[#1E56B0]" />
                              A {orden.distanciaKm < 1 ? `${Math.round(orden.distanciaKm * 1000)} m` : `${orden.distanciaKm.toFixed(1)} km`}
                            </span>
                          )}

                          {orden.cliente_nombre && (
                            <span className="text-[11px] text-slate-500">
                              Cliente: <strong className="text-slate-800 font-bold">{orden.cliente_nombre}</strong>
                            </span>
                          )}
                        </div>

                        {/* Falla Reportada Real */}
                        <h3 className="text-lg sm:text-xl font-extrabold text-[#0A1525] tracking-tight">
                          {orden.falla_reportada}
                        </h3>

                        {/* Modelo de Carro (Marca, Modelo, Año) y Sector Reales */}
                        <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-600 pt-1">
                          <span className="inline-flex items-center gap-1.5 font-bold text-[#0A1525]">
                            <Car className="w-4 h-4 text-[#1E56B0]" />
                            {vehiculoCompleto}
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-600">
                            <MapPin className="w-4 h-4 text-slate-400" />
                            {orden.sector}
                          </span>
                          {orden.foto_odometro_url && (
                            <>
                              <span>•</span>
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <Check className="w-3 h-3" />
                                Odómetro cargado
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Ganancia Real y Botones de Acción */}
                      <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                        <div className="text-left lg:text-right">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                            Tu Ganancia
                          </span>
                          <span className="text-2xl sm:text-3xl font-black text-[#0A1525] tracking-tight">
                            {gananciaFormatted}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-semibold block">
                            Pago garantizado
                          </span>
                        </div>

                        {estaAsignado ? (
                          <div className="flex items-center gap-2 w-full lg:w-auto">
                            {/* Botón directo a Ejecutar Servicio y Checklist Odómetro */}
                            <Link
                              href={`/aliados/servicio/${orden.id}`}
                              className="flex-1 lg:w-44 h-12 text-sm font-black rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer bg-[#0A1525] hover:bg-[#1E56B0] text-white active:scale-95"
                            >
                              <ClipboardCheck className="w-4 h-4 text-[#CCFF00]" />
                              <span>Ejecutar</span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </Link>

                            {/* Botón para Finalizar Servicio y liberar cupo */}
                            <button
                              type="button"
                              disabled={finalizandoId === orden.id}
                              onClick={() => handleFinalizarServicio(orden.id)}
                              className="h-12 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
                              title="Marcar como finalizado para tomar la siguiente orden"
                            >
                              {finalizandoId === orden.id ? (
                                <Loader2 className="w-4 h-4 animate-spin text-white" />
                              ) : (
                                <Check className="w-4 h-4 stroke-[3]" />
                              )}
                              <span className="hidden sm:inline">Finalizar</span>
                            </button>
                          </div>
                        ) : (
                          /* Botón Aceptar Servicio para solicitudes libres */
                          <motion.button
                            type="button"
                            disabled={isAccepting}
                            whileHover={{ scale: isAccepting ? 1 : 1.02 }}
                            whileTap={{ scale: isAccepting ? 1 : 0.98 }}
                            onClick={() => {
                              if (tieneOrdenActiva) {
                                setModalBloqueoOrden(true);
                                return;
                              }
                              handleAceptarServicio(orden);
                            }}
                            className={`w-full lg:w-48 h-12 text-xs font-black rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border ${tieneOrdenActiva
                              ? 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-300'
                              : isAccepting
                                ? 'bg-slate-200 text-slate-500 cursor-not-allowed border-transparent'
                                : 'bg-[#CCFF00] hover:bg-[#b8e600] text-[#0A1525] border-[#0A1525]/10'
                              }`}
                          >
                            {tieneOrdenActiva ? (
                              <>
                                <Lock className="w-4 h-4 text-slate-500" />
                                <span>1 Orden por Vez</span>
                              </>
                            ) : isAccepting ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin text-[#0A1525]" />
                                <span>Aceptando...</span>
                              </>
                            ) : (
                              <>
                                <Navigation className="w-4 h-4 text-[#0A1525]" />
                                <span>Aceptar Servicio</span>
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

      </main>

      {/* Inputs Ocultos de Archivo y Cámara Nativa */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFotoArchivo}
        className="hidden"
      />
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="user"
        onChange={handleFotoArchivo}
        className="hidden"
      />

      {/* Onboarding Modal de Bienvenida para Mecánicos */}
      <OnboardingModal
        rol="MECANICO"
        isOpen={mostrarTutorial ? true : undefined}
        onClose={() => {
          setMostrarTutorial(false);
          setMostrarBotonTutorial(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('onboarding_seen_mecanico', 'true');
          }
        }}
      />

      {/* Toast Flotante de Notificaciones */}
      <AnimatePresence>
        {toastAceptado && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 bg-[#0A1525] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 font-black">
              <Check className="w-4 h-4 stroke-[3]" />
            </div>
            <div className="text-xs font-semibold text-slate-100 flex-1">
              {toastAceptado}
            </div>
            <button
              type="button"
              onClick={() => setToastAceptado(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-1 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}

        {toastPush && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-20 right-4 z-50 bg-[#0A1525] text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shrink-0 font-black">
              <Bell className="w-4 h-4 text-[#0A1525]" />
            </div>
            <div className="text-xs font-semibold text-slate-100 flex-1">
              {toastPush}
            </div>
            <button
              type="button"
              onClick={() => setToastPush(null)}
              className="text-slate-400 hover:text-white cursor-pointer ml-1 text-xs"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL DIALOG: EDITAR PERFIL & FOTO                      */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalEditarPerfilOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 space-y-5 border border-[#CBD5E1] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button
                type="button"
                onClick={() => setModalEditarPerfilOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#1E56B0] bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                  Credencial de Especialista Aliado
                </span>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  Editar Perfil &amp; Fotografía
                </h3>
                <p className="text-xs text-slate-500">
                  Actualiza tus datos públicos y tu foto de perfil visible en los despachos y ante los clientes.
                </p>
              </div>

              {/* Sección Foto de Perfil */}
              <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-2xl bg-[#0A1525] border-2 border-[#CBD5E1] p-1 overflow-hidden shadow-md">
                    <img
                      src={formFotoPreview || fotoPerfil}
                      alt="Vista previa foto perfil"
                      className="w-full h-full rounded-xl object-cover object-center"
                    />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#CCFF00] border-2 border-white flex items-center justify-center shadow-xs">
                    <Check className="w-3 h-3 text-[#0A1525] stroke-[3]" />
                  </span>
                </div>

                <div className="flex-1 w-full space-y-2">
                  <span className="text-[11px] font-extrabold uppercase text-slate-500 block">
                    Foto de Perfil
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    {/* Botón Tomar Fotografía */}
                    <button
                      type="button"
                      onClick={handleIniciarCamaraWeb}
                      className="h-10 px-2 bg-[#0A1525] hover:bg-[#1E56B0] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="Tomar fotografía con la cámara de tu teléfono o webcam"
                    >
                      <Camera className="w-3.5 h-3.5 text-[#CCFF00]" />
                      <span>Tomar Foto</span>
                    </button>

                    {/* Botón Subir Archivo */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-10 px-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer active:scale-95"
                      title="Subir desde galería o archivos del dispositivo"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#1E56B0]" />
                      <span>Subir Foto</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Formatos JPG, PNG, WebP permitidos.
                  </p>
                </div>
              </div>

              {/* Formulario de Datos */}
              <form onSubmit={handleGuardarPerfil} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    required
                    placeholder="Ej. jose antonio"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-[#0A1525] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E56B0]/20 focus:border-[#1E56B0]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Especialidad Mecánica
                  </label>
                  <input
                    type="text"
                    value={formEspecialidad}
                    onChange={(e) => setFormEspecialidad(e.target.value)}
                    required
                    placeholder="Ej. Mecánica General & Inyección"
                    className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-[#0A1525] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E56B0]/20 focus:border-[#1E56B0]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Teléfono Móvil
                    </label>
                    <input
                      type="text"
                      value={formTelefono}
                      onChange={(e) => setFormTelefono(e.target.value)}
                      placeholder="+58 412 123 4567"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-[#0A1525] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E56B0]/20 focus:border-[#1E56B0]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Zona de Cobertura
                    </label>
                    <input
                      type="text"
                      value={formZona}
                      onChange={(e) => setFormZona(e.target.value)}
                      placeholder="Gran Caracas"
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 bg-white text-[#0A1525] text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E56B0]/20 focus:border-[#1E56B0]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setModalEditarPerfilOpen(false)}
                    className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-[#CCFF00] font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <Check className="w-4 h-4 text-[#CCFF00] stroke-[3]" />
                    <span>Guardar Cambios</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL DIALOG: TOMAR FOTO CON CÁMARA (WEBCAM / LIVE)     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalCamaraWebOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/85 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl p-5 space-y-4 border border-[#CBD5E1] shadow-2xl relative"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#CCFF00] flex items-center justify-center text-[#0A1525]">
                    <Camera className="w-4 h-4 text-[#0A1525]" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-[#0A1525]">
                      Capturar Foto de Perfil
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Ubica tu rostro en el centro del encuadre
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCerrarCamaraWeb}
                  className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Viewport de Cámara en Vivo con Guía Facial */}
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-h-72 w-full flex items-center justify-center border-2 border-slate-700 shadow-inner">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />

                {/* Retículo / Guía de encuadre */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-48 rounded-full border-2 border-dashed border-[#CCFF00]/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)] flex items-center justify-center">
                    <span className="text-[10px] text-white/90 bg-black/50 px-2 py-0.5 rounded-full font-bold">
                      Alinea tu rostro
                    </span>
                  </div>
                </div>
              </div>

              {/* Botones de Captura */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleCerrarCamaraWeb}
                  className="flex-1 h-12 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleCapturarFotoWeb}
                  className="flex-1 h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-[#CCFF00] font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
                >
                  <Camera className="w-4 h-4 text-[#CCFF00]" />
                  <span>Capturar Fotografía</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* MODAL DIALOG: REGLA 1 ORDEN POR VEZ                     */}
      {/* ======================================================== */}
      <AnimatePresence>
        {modalBloqueoOrden && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1525]/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 15 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 text-center space-y-5 border border-[#CBD5E1] shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setModalBloqueoOrden(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner border border-amber-200">
                <Lock className="w-8 h-8 stroke-[2.5]" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">
                  Regla Operativa SLA • 1 Orden por Mecánico
                </span>
                <h3 className="text-xl font-black text-[#0A1525] tracking-tight">
                  Ya tienes un servicio en curso
                </h3>
                <p className="text-xs text-[#475569] leading-relaxed">
                  Para asegurar el tiempo de respuesta (SLA &lt; 30 min) y la máxima calidad de atención técnica, debes terminar tu servicio activo antes de aceptar una nueva orden.
                </p>
              </div>

              {ordenActivaEnCurso && (
                <div className="bg-[#F8FAFC] border border-[#CBD5E1] rounded-2xl p-4 text-left space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono font-bold text-slate-500">
                      #{ordenActivaEnCurso.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="text-[10px] font-black uppercase bg-blue-100 text-[#1E56B0] px-2 py-0.5 rounded">
                      {ordenActivaEnCurso.estado}
                    </span>
                  </div>
                  <p className="text-sm font-black text-[#0A1525]">
                    {[ordenActivaEnCurso.vehiculo_marca, ordenActivaEnCurso.vehiculo_modelo, ordenActivaEnCurso.vehiculo_anio]
                      .filter(Boolean)
                      .join(' ') || ordenActivaEnCurso.vehiculo_modelo || 'Vehículo'}
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {ordenActivaEnCurso.falla_reportada}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                {ordenActivaEnCurso && (
                  <>
                    <Link
                      href={`/aliados/servicio/${ordenActivaEnCurso.id}`}
                      onClick={() => setModalBloqueoOrden(false)}
                      className="flex-1 h-12 bg-[#0A1525] hover:bg-[#1E56B0] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs active:scale-95"
                    >
                      <ClipboardCheck className="w-4 h-4 text-[#CCFF00]" />
                      <span>Ir al Servicio Actual</span>
                    </Link>

                    <button
                      type="button"
                      disabled={finalizandoId === ordenActivaEnCurso.id}
                      onClick={() => handleFinalizarServicio(ordenActivaEnCurso.id)}
                      className="h-12 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
                      title="Marcar como finalizado para desbloquear la toma de órdenes"
                    >
                      {finalizandoId === ordenActivaEnCurso.id ? (
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                      ) : (
                        <Check className="w-4 h-4 stroke-[3]" />
                      )}
                      <span>Finalizar Servicio</span>
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Botón Flotante Soporte WhatsApp */}
      <BotonSoporteWhatsApp
        modo="fab"
        mensaje="Hola, soy mecánico aliado de TuTallerMóvil y necesito soporte de la Torre de Despacho"
      />

    </div>
  );
}
