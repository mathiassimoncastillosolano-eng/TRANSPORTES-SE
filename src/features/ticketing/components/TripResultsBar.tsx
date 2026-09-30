import { ArrowUpDown, RotateCcw } from 'lucide-react'
import { Select } from '@/components/ui/Select'
import { cn } from '@/utils/cn'
import type { OrdenViajes } from '../types'
import { OPCIONES_ORDEN } from '../utils/viajes'

interface TripResultsBarProps {
  total: number
  orden: OrdenViajes
  hayFiltros: boolean
  onOrden: (o: OrdenViajes) => void
  onReset: () => void
}

/** Barra ligera sobre la lista: cuántos viajes hay, cómo se ordenan y cómo volver a la búsqueda inicial. No filtra. */
export function TripResultsBar({ total, orden, hayFiltros, onOrden, onReset }: TripResultsBarProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
      <p className="text-sm text-text-700" aria-live="polite">
        <span key={total} className="animate-step-swap inline-block font-semibold tabular-nums text-text-900">
          {total}
        </span>{' '}
        {total === 1 ? 'viaje encontrado' : 'viajes encontrados'}
      </p>

      <div className="flex items-center gap-2">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="flex items-center gap-1.5 text-xs text-text-500">
            <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
            Ordenar por
          </span>
          <div className="w-[230px]">
            <Select
              ariaLabel="Ordenar por"
              value={orden}
              onChange={(v) => onOrden(v as OrdenViajes)}
              options={OPCIONES_ORDEN}
              className="h-8 text-[13px]"
            />
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          disabled={!hayFiltros}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-medium transition-colors duration-150',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-line',
            hayFiltros ? 'text-text-700 hover:bg-surface-hover hover:text-text-900' : 'cursor-default text-text-400 opacity-60',
          )}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Restablecer
        </button>
      </div>
    </div>
  )
}
