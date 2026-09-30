import { cn } from '@/utils/cn'

interface SidebarHeaderProps {
  collapsed: boolean
}

/** Logotipo de marca en la cabecera del Sidebar. */
export function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-16 shrink-0 items-center border-b border-ink-800 px-5',
        collapsed && 'justify-center px-0',
      )}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-sm font-semibold text-ink-950">
          R
        </span>
        {!collapsed && (
          <span
            className="whitespace-nowrap text-[17px] font-semibold tracking-tight text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            RutaLibre
          </span>
        )}
      </div>
    </div>
  )
}
