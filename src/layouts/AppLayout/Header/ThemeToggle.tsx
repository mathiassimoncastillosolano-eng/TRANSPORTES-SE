import { Check, Laptop, Moon, Sun } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { Tooltip } from '@/components/ui/Tooltip'
import { resolveTheme, useThemeStore, type ThemeMode } from '@/stores/themeStore'
import { optionBaseClasses, optionCheckClasses, optionHoverClasses } from '@/components/ui/selectStyles'
import { cn } from '@/utils/cn'

const options: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'Claro', icon: Sun },
  { value: 'dark', label: 'Oscuro', icon: Moon },
  { value: 'system', label: 'Sistema', icon: Laptop },
]

/**
 * Selector de tema del Header. Un botón muestra el ícono del tema
 * *efectivo* actual (sol/luna) y, al abrirlo, deja elegir explícitamente
 * entre Claro / Oscuro / Sistema — igual que el resto de menús del header
 * (Dropdown genérico, mismas transiciones y geometría).
 */
export function ThemeToggle() {
  const mode = useThemeStore((s) => s.mode)
  const setMode = useThemeStore((s) => s.setMode)
  const resolved = resolveTheme(mode)
  const CurrentIcon = resolved === 'dark' ? Moon : Sun

  return (
    <Tooltip label="Tema" side="bottom">
      <Dropdown
        width={176}
        trigger={({ open }) => (
          <span
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-lg text-text-500 transition-colors hover:bg-surface-sunken hover:text-text-900',
              open && 'bg-surface-sunken text-text-900',
            )}
            aria-label="Cambiar tema"
          >
            <CurrentIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </span>
        )}
      >
        <div className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-text-400">
          Tema
        </div>
        {options.map((option) => {
          const selected = option.value === mode
          return (
            <button
              key={option.value}
              type="button"
              role="menuitemradio"
              aria-checked={selected}
              onClick={() => setMode(option.value)}
              className={cn(optionBaseClasses, optionHoverClasses(selected))}
            >
              <option.icon className="h-4 w-4 text-text-400" aria-hidden="true" />
              <span className={cn(selected && 'font-medium')}>{option.label}</span>
              {selected && <Check className={cn(optionCheckClasses, 'ml-auto')} aria-hidden="true" />}
            </button>
          )
        })}
      </Dropdown>
    </Tooltip>
  )
}
