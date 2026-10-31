import { Tooltip } from '@/components/ui/Tooltip'
import { Badge } from '@/components/ui/Badge'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/utils/cn'
import type { NavItem } from '@/types/navigation'

interface SidebarItemProps {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}

/**
 * Un enlace individual del Sidebar. Icono siempre visible; label solo
 * si expandido. En vez de navegar a una ruta, activa la sección
 * correspondiente dentro de la Main View (`activeSectionId` en `uiStore`).
 */
export function SidebarItem({ item, collapsed, onNavigate }: SidebarItemProps) {
  const Icon = item.icon
  const isActive = useUIStore((s) => s.activeSectionId === item.sectionId)
  const setActiveSection = useUIStore((s) => s.setActiveSection)

  function handleClick() {
    setActiveSection(item.sectionId)
    onNavigate?.()
  }

  const link = (
    <button
      type="button"
      onClick={handleClick}
      aria-current={isActive ? 'page' : undefined}
      className={cn(
        'group relative flex w-full items-center gap-3 rounded-[10px] px-3 py-2 text-left text-[13.5px] font-medium',
        'transition-[background-color,color] duration-200 ease-[var(--ease-premium)]',
        'active:scale-[0.98]',
        collapsed && 'justify-center px-0 py-2.5',
        isActive
          ? 'bg-white/[0.08] text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.06)]'
          : 'text-ink-300 hover:bg-white/[0.05] hover:text-white',
      )}
      aria-label={item.title}
    >
      <span
        aria-hidden="true"
        className={cn(
          'absolute -left-2.5 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-full bg-accent-400',
          'transition-[opacity,transform] duration-200 ease-[var(--ease-premium)]',
          isActive && !collapsed ? 'scale-100 opacity-100' : 'scale-0 opacity-0',
        )}
      />
      <Icon
        className={cn(
          'h-[18px] w-[18px] shrink-0 transition-[color,transform] duration-200 ease-[var(--ease-premium)] group-hover:scale-105',
          isActive ? 'text-accent-400' : 'text-ink-300 group-hover:text-white',
        )}
        aria-hidden="true"
      />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.title}</span>
          {item.soon && (
            <span className="rounded-full border border-ink-800 px-1.5 py-px text-[10px] font-medium uppercase tracking-wide text-ink-400">
              Pronto
            </span>
          )}
          {item.badge !== undefined && (
            <Badge tone="accent" className="bg-accent-500/15 text-accent-400">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  )

  if (!collapsed) return link

  return (
    <Tooltip label={item.soon ? `${item.title} · Pronto` : item.title} side="right" className="flex w-full justify-center">
      {link}
    </Tooltip>
  )
}
