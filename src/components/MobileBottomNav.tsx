'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Home,
  CarFront,
  Wrench,
  MessageCircle,
  MessageSquare,
  Wallet,
  UserCheck,
  Kanban,
  Landmark,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { SolicitarMecanicoModal } from '@/components/SolicitarMecanicoModal';

type UserRole = 'CLIENTE' | 'MECANICO' | 'RUNNER' | 'OPERADORA' | 'ADMIN';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  href?: string;
  tabId?: string;
  isActive?: boolean;
  isCenter?: boolean;
  action?: string;
  isExternal?: boolean;
}

function MobileBottomNavInner() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<UserRole>('CLIENTE');
  const [solicitarModalOpen, setSolicitarModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    // 1. Detectar rol por la ruta actual
    if (pathname.startsWith('/admin')) {
      setRole('OPERADORA');
      return;
    }
    if (pathname.startsWith('/aliados')) {
      setRole('MECANICO');
      return;
    }
    if (pathname.startsWith('/runner')) {
      setRole('RUNNER');
      return;
    }

    // 2. Detectar rol por cookies o localStorage
    if (typeof document !== 'undefined') {
      const match = document.cookie.match(/(^| )ttm_role=([^;]+)/);
      if (match && match[2]) {
        const cookieRole = decodeURIComponent(match[2]).toUpperCase() as UserRole;
        if (['ADMIN', 'OPERADORA', 'MECANICO', 'RUNNER', 'CLIENTE'].includes(cookieRole)) {
          setRole(cookieRole);
          return;
        }
      }
    }

    // 3. Predeterminado: CLIENTE
    setRole('CLIENTE');
  }, [pathname]);

  // Manejar acciones especiales según el rol
  const handleNavClick = (
    e: React.MouseEvent,
    item: {
      action?: string;
      href?: string;
      tabId?: string;
    }
  ) => {
    if (item.action === 'solicitar') {
      e.preventDefault();
      setSolicitarModalOpen(true);
      return;
    }

    if (item.action === 'whatsapp_admin') {
      e.preventDefault();
      if (pathname === '/admin/despacho') {
        window.dispatchEvent(new CustomEvent('ttm:open-whatsapp'));
      } else {
        router.push('/admin/despacho?modal=whatsapp');
      }
      return;
    }

    if (item.action === 'operadoras_admin') {
      e.preventDefault();
      if (pathname === '/admin/despacho') {
        window.dispatchEvent(new CustomEvent('ttm:open-operadoras'));
      } else {
        router.push('/admin/despacho?modal=operadoras');
      }
      return;
    }

    if (item.tabId && (pathname.startsWith('/aliados') || pathname.startsWith('/runner'))) {
      setActiveTab(item.tabId);
      window.dispatchEvent(new CustomEvent('ttm:switch-tab', { detail: item.tabId }));
    }
  };

  // Ítems para CLIENTE
  const clienteItems: NavItem[] = [
    {
      id: 'inicio',
      label: 'Inicio',
      icon: Home,
      href: '/',
      isActive: pathname === '/'
    },
    {
      id: 'garaje',
      label: 'Mi Garaje',
      icon: CarFront,
      href: '/cliente/dashboard',
      isActive: pathname.startsWith('/cliente')
    },
    {
      id: 'pedir',
      label: 'Pedir',
      icon: Wrench,
      isCenter: true,
      action: 'solicitar'
    },
    {
      id: 'chat',
      label: 'Chats',
      icon: MessageCircle,
      href: 'https://wa.me/584142314194?text=Hola%20TuTallerM%C3%B3vil%2C%20necesito%20asistencia%20mec%C3%A1nica',
      isExternal: true,
      isActive: false
    }
  ];

  // Ítems para MECÁNICO / RUNNER
  const mecanicoItems: NavItem[] = [
    {
      id: 'portal',
      label: 'Inicio',
      icon: Home,
      href: '/aliados/portal',
      tabId: 'servicios',
      isActive: pathname === '/aliados/portal' && (!activeTab || activeTab === 'servicios')
    },
    {
      id: 'servicios',
      label: 'Servicios',
      icon: Wrench,
      href: '/aliados/portal#servicios',
      tabId: 'feed',
      isActive: activeTab === 'feed'
    },
    {
      id: 'billetera',
      label: 'Ganancias',
      icon: Wallet,
      href: '/aliados/portal#billetera',
      tabId: 'billetera',
      isActive: activeTab === 'billetera'
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: UserCheck,
      href: '/aliados/portal#perfil',
      tabId: 'perfil',
      isActive: activeTab === 'perfil'
    }
  ];

  // Ítems para OPERADORA / ADMIN
  const operadoraItems: NavItem[] = [
    {
      id: 'kanban',
      label: 'Kanban',
      icon: Kanban,
      href: '/admin/despacho',
      isActive: pathname === '/admin/despacho'
    },
    {
      id: 'chats',
      label: 'Chats',
      icon: MessageSquare,
      action: 'whatsapp_admin',
      href: '/admin/despacho?modal=whatsapp',
      isActive: false
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      icon: Landmark,
      href: '/admin/finanzas',
      isActive: pathname.startsWith('/admin/finanzas')
    },
    {
      id: 'perfil',
      label: 'Perfil',
      icon: ShieldCheck,
      action: 'operadoras_admin',
      href: '/admin/despacho?modal=operadoras',
      isActive: false
    }
  ];

  // Seleccionar conjunto de ítems según rol
  const items =
    role === 'ADMIN' || role === 'OPERADORA'
      ? operadoraItems
      : role === 'MECANICO' || role === 'RUNNER'
      ? mecanicoItems
      : clienteItems;

  return (
    <>
      <nav
        aria-label="Navegación Móvil Principal"
        className="fixed bottom-3 inset-x-3 sm:inset-x-6 md:hidden z-40 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-[0_12px_36px_rgba(10,21,37,0.16)] rounded-2xl px-2 py-1.5 flex items-center justify-around select-none safe-area-bottom"
      >
        {items.map((item) => {
          const Icon = item.icon;

          // Botón Central Destacado (Verde Lima: Pedir Mecánico)
          if ('isCenter' in item && item.isCenter) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleNavClick(e, item)}
                className="relative -top-3.5 flex flex-col items-center justify-center group cursor-pointer focus:outline-none min-h-[50px] min-w-[50px]"
                aria-label="Pedir Mecánico Ahora"
              >
                <div className="w-14 h-14 rounded-2xl bg-[#CCFF00] text-[#0A1525] flex items-center justify-center shadow-lg border-[3px] border-white group-active:scale-95 transition-transform duration-150">
                  <Icon className="w-6 h-6 stroke-[2.6]" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#0A1525] mt-0.5">
                  {item.label}
                </span>
              </button>
            );
          }

          // Botón Normal de Navegación
          const isCurrentActive = Boolean(item.isActive);

          const content = (
            <div
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[54px] min-h-[44px] transition-all duration-150 active:scale-95 ${
                isCurrentActive
                  ? 'text-[#1E56B0] font-black'
                  : 'text-slate-500 hover:text-[#0A1525] font-semibold'
              }`}
            >
              <div className="relative flex items-center justify-center">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isCurrentActive ? 'scale-110 stroke-[2.4] text-[#1E56B0]' : 'stroke-[1.8]'
                  }`}
                />
                {isCurrentActive && (
                  <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-[#1E56B0]" />
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-1 truncate ${
                  isCurrentActive ? 'text-[#1E56B0] font-bold' : 'text-slate-500'
                }`}
              >
                {item.label}
              </span>
            </div>
          );

          if (item.action) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={(e) => handleNavClick(e, item)}
                className="cursor-pointer focus:outline-none"
              >
                {content}
              </button>
            );
          }

          if (item.isExternal) {
            return (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="focus:outline-none"
              >
                {content}
              </a>
            );
          }

          return (
            <Link key={item.id} href={item.href || '/'} className="focus:outline-none">
              {content}
            </Link>
          );
        })}
      </nav>

      {/* Modal centralizado para 'Pedir Mecánico' desde cualquier vista móvil */}
      <SolicitarMecanicoModal
        open={solicitarModalOpen}
        onOpenChange={setSolicitarModalOpen}
        initialTipoServicio="FALLA"
      />
    </>
  );
}

export default function MobileBottomNav() {
  return (
    <Suspense fallback={null}>
      <MobileBottomNavInner />
    </Suspense>
  );
}
