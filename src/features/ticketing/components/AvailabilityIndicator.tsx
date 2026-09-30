import { Circle, Flame, TriangleAlert } from 'lucide-react'
import { cn } from '@/utils/cn'
import { nivelDisponibilidad, type NivelDisponibilidad } from '../utils/viajes'

interface AvailabilityIndicatorProps {
  libres: number
  capacidad: number
  /** `true` cuando el viaje no se puede vender por otra razón (cancelado, ya salió): se muestra como no disponible. */
  bloqueado?: boolean
  className?: string
}

const estilos: Record<NivelDisponibilidad, { texto: string; barra: string; chip: string }> = {
  alta: { texto: 'text-accent-line', barra: 'bg-accent-line', chip: 'bg-accent-line/10 text-accent-line' },
  pocos: { texto: 'text-warning-500', barra: 'bg-warning-500', chip: 'bg-warning-500/12 text-warning-500' },
  ultimos: { texto: 'text-danger-600', barra: 'bg-danger-500', chip: 'bg-danger-500/12 text-danger-600' },
  agotado: { texto: 'text-text-500', barra: 'bg-text-400', chip: 'bg-text-400/12 text-text-500' },
}

/**
 * Disponibilidad de un viaje: cifra "libres / capacidad", barra proporcional y
 * un estado en texto + icono. El color refuerza el nivel pero nunca lo comunica
 * solo: cada nivel tiene su propia etiqueta y forma de icono.
 */
export function AvailabilityIndicator({ libres, capacidad, bloqueado, className }: AvailabilityIndicatorProps) {
  const nivel: NivelDisponibilidad = bloqueado ? 'agotado' : nivelDisponibilidad(libres)
  const e = estilos[nivel]
  const proporcion = capacidad > 0 ? Math.max(0, Math.min(1, libres / capacidad)) : 0

  const etiqueta =
    nivel === 'agotado'
      ? bloqueado
        ? 'No disponible'
        : 'Agotado'
      : nivel === 'ultimos'
        ? 'Últimos asientos'
        : nivel === 'pocos'
          ? 'Pocos asientos'
          : null

  const icono =
    nivel === 'agotado' ? (
      <Circle className="h-3 w-3" aria-hidden="true" />
    ) : nivel === 'ultimos' ? (
      <Flame className="h-3 w-3" aria-hidden="true" />
    ) : nivel === 'pocos' ? (
      <TriangleAlert className="h-3 w-3" aria-hidden="true" />
    ) : (
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
    )

  return (
    <div className={cn('min-w-0', className)}>
      <div className="flex items-center justify-between gap-3">
        <p className="min-w-0 truncate text-xs text-text-500">
          <span className="text-sm font-semibold tabular-nums text-text-900">{libres}</span>
          <span className="tabular-nums"> / {capacidad}</span> asientos disponibles
        </p>
        {/* Con disponibilidad alta la cifra y la barra ya lo dicen todo: el chip solo aparece ante un aviso. */}
        {etiqueta && (
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-medium',
              e.chip,
            )}
          >
            {icono}
            {etiqueta}
          </span>
        )}
      </div>
      <div
        role="meter"
        aria-label="Asientos disponibles"
        aria-valuemin={0}
        aria-valuemax={capacidad}
        aria-valuenow={libres}
        aria-valuetext={`${libres} de ${capacidad} asientos disponibles`}
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-border-strong/50"
      >
        <div
          className={cn('h-full origin-left rounded-full transition-transform duration-500 ease-[var(--ease-premium)]', e.barra)}
          style={{ transform: `scaleX(${proporcion})` }}
        />
      </div>
    </div>
  )
}
