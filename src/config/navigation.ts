import {
  Activity,
  BarChart3,
  Bus,
  LayoutDashboard,
  Receipt,
  ScanLine,
  Settings,
  Ticket,
  UserCircle,
  Users,
} from 'lucide-react'
import type { AuthUser } from '@/types/auth'
import type { NavEntry, NavItem } from '@/types/navigation'
import { hasPermission } from '@/stores/authStore'

/**
 * Estructura de navegación del Sistema Empresarial.
 *
 * Este archivo es la ÚNICA fuente de verdad de la navegación lateral.
 * Agregar, quitar o reordenar un módulo se hace aquí — nunca dentro
 * de los componentes del Sidebar. Cada `sectionId` implementado debe existir
 * en `views/MainView/SectionRegistry.tsx`; los módulos con `soon: true` aún
 * no existen y abren un placeholder "Próximamente" (no tienen lógica).
 *
 *   Operaciones   → Registrar pasaje ✔ · Abordaje · Viajes
 *   Comercial     → Pasajes · Clientes
 *   Supervisión   → Dashboard ✔ · Operaciones · Reportes
 *   Configuración → Mi perfil · Ajustes
 */
export const SECCION_INICIAL = 'registrar-pasaje'

export const navigationConfig: NavEntry[] = [
  {
    kind: 'section',
    section: {
      id: 'operaciones',
      label: 'Operaciones',
      items: [
        { id: 'registrar-pasaje', title: 'Registrar pasaje', sectionId: 'registrar-pasaje', icon: Ticket, requiredPermission: 'pasajes:registrar' },
        { id: 'abordaje', title: 'Abordaje', sectionId: 'abordaje', icon: ScanLine, soon: true },
        { id: 'viajes', title: 'Viajes', sectionId: 'viajes', icon: Bus, soon: true },
      ],
    },
  },
  {
    kind: 'section',
    section: {
      id: 'comercial',
      label: 'Comercial',
      items: [
        { id: 'pasajes', title: 'Pasajes', sectionId: 'pasajes', icon: Receipt, soon: true },
        { id: 'clientes', title: 'Clientes', sectionId: 'clientes', icon: Users, soon: true },
      ],
    },
  },
  {
    kind: 'section',
    section: {
      id: 'supervision',
      label: 'Supervisión',
      items: [
        { id: 'dashboard', title: 'Dashboard', sectionId: 'dashboard', icon: LayoutDashboard, requiredPermission: 'dashboard:ver' },
        { id: 'supervision-operaciones', title: 'Operaciones', sectionId: 'supervision-operaciones', icon: Activity, soon: true },
        { id: 'reportes', title: 'Reportes', sectionId: 'reportes', icon: BarChart3, soon: true },
      ],
    },
  },
  {
    kind: 'section',
    section: {
      id: 'configuracion',
      label: 'Configuración',
      items: [
        { id: 'mi-perfil', title: 'Mi perfil', sectionId: 'mi-perfil', icon: UserCircle, soon: true },
        { id: 'ajustes', title: 'Ajustes', sectionId: 'ajustes', icon: Settings, soon: true },
      ],
    },
  },
]

/** Sección (grupo) y item de una `sectionId`, para migas de pan y command palette. */
export function findNavContext(sectionId: string): { sectionLabel?: string; item: NavItem } | undefined {
  for (const entry of navigationConfig) {
    if (entry.kind === 'item') {
      if (entry.item.sectionId === sectionId) return { item: entry.item }
    } else {
      const item = entry.section.items.find((i) => i.sectionId === sectionId)
      if (item) return { sectionLabel: entry.section.label, item }
    }
  }
  return undefined
}

/** Aplana la config a una lista simple de items — útil para breadcrumbs. */
export function flattenNavItems(entries: NavEntry[] = navigationConfig): NavItem[] {
  return entries.flatMap((entry) => (entry.kind === 'item' ? [entry.item] : entry.section.items))
}

/** Oculta los items para los que el usuario no tiene permiso. */
export function filterNavByPermission(entries: NavEntry[], user: AuthUser | null): NavEntry[] {
  return entries.flatMap((entry): NavEntry[] => {
    if (entry.kind === 'item') return hasPermission(user, entry.item.requiredPermission) ? [entry] : []
    const items = entry.section.items.filter((i) => hasPermission(user, i.requiredPermission))
    return items.length ? [{ kind: 'section', section: { ...entry.section, items } }] : []
  })
}
