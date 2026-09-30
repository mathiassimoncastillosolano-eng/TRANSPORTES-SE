import { Building2, Check, ChevronDown } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { Skeleton } from '@/components/feedback/Skeleton'
import { useCatalogo } from '@/hooks/useCatalogo'
import { useUIStore } from '@/stores/uiStore'
import { optionBaseClasses, optionCheckClasses, optionHoverClasses } from '@/components/ui/selectStyles'
import { cn } from '@/utils/cn'

/**
 * Selector de sede activa. Una sede es una agencia: es la misma entidad
 * que agrupa el Dashboard y, en el registro de pasajes, la sede de venta
 * del pasaje. La lista viene del catálogo (servicio), no de una constante.
 */
export function BranchSelector() {
  const { catalogo, cargando } = useCatalogo()
  const currentId = useUIStore((s) => s.currentBranchId)
  const setCurrentBranchId = useUIStore((s) => s.setCurrentBranchId)

  if (cargando || !catalogo) return <Skeleton className="h-9 w-40 rounded-lg" />

  const { agencias } = catalogo
  const current = agencias.find((b) => b.id === currentId) ?? agencias[0]

  return (
    <Dropdown
      width={280}
      trigger={({ open }) => (
        <span
          className={cn(
            'flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text-700 transition-colors hover:bg-surface-sunken',
            open && 'bg-surface-sunken',
          )}
        >
          <Building2 className="h-4 w-4 text-text-400" aria-hidden="true" />
          <span className="hidden max-w-[180px] truncate sm:inline">
            <span className="text-text-500">Sede: </span>
            {current.name}
          </span>
          <span className="sr-only sm:hidden">Sede: {current.name}</span>
          <ChevronDown
            className={cn(
              'h-4 w-4 text-text-400 transition-transform duration-200 ease-[var(--ease-premium)]',
              open && 'rotate-180',
            )}
            aria-hidden="true"
          />
        </span>
      )}
    >
      <p className="px-2.5 py-1.5 text-xs font-medium uppercase tracking-wide text-text-400">
        Sede de venta
      </p>
      {agencias.map((agencia) => {
        const selected = agencia.id === current.id
        return (
          <button
            key={agencia.id}
            type="button"
            role="menuitemradio"
            aria-checked={selected}
            onClick={() => setCurrentBranchId(agencia.id)}
            className={cn(optionBaseClasses, 'justify-between', optionHoverClasses(selected))}
          >
            <span className="min-w-0">
              <span className={cn('block truncate', selected && 'font-medium')}>{agencia.name}</span>
              <span className="block truncate text-xs text-text-500">{agencia.location}</span>
            </span>
            {selected && <Check className={optionCheckClasses} aria-hidden="true" />}
          </button>
        )
      })}
    </Dropdown>
  )
}
