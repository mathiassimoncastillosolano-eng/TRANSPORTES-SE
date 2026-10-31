import { cn } from '@/utils/cn'

interface SidebarHeaderProps {
  collapsed: boolean
}

/** Logotipo de marca en la cabecera del Sidebar. */
export function SidebarHeader({ collapsed }: SidebarHeaderProps) {
  return (
    <div
      className={cn(
        'flex h-16 shrink-0 items-center border-b border-white/[0.07] px-5',
        collapsed && 'justify-center px-0',
      )}
    >
      <div className="flex items-center gap-2.5 overflow-hidden">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-br from-accent-400 to-accent-500 text-sm font-bold text-ink-950 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_6px_14px_-6px_rgb(16_185_129/0.7)]">
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
