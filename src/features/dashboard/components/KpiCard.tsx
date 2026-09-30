import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/feedback/Skeleton'
import { cn } from '@/utils/cn'

interface KpiCardProps {
  label: string
  /** Valor ya formateado; `null` = sin datos. */
  valor: string | null
  icon: LucideIcon
  /** Variación calculada (no escrita a mano); `null` = sin base de comparación. */
  variacion: number | null
  tipoVariacion: 'porcentaje' | 'pp'
  loading?: boolean
  /** Retraso de entrada (índice en la grilla) para el efecto escalonado. */
  delayMs?: number
}

function textoVariacion(v: number, tipo: 'porcentaje' | 'pp'): string {
  const signo = v > 0 ? '+' : v < 0 ? '−' : ''
  const abs = Math.abs(v).toLocaleString('es-PE', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  return tipo === 'pp' ? `${signo}${abs} pp` : `${signo}${abs}%`
}

/** Tarjeta de indicador: valor y variación frente al período anterior comparable. */
export function KpiCard({ label, valor, icon: Icon, variacion, tipoVariacion, loading, delayMs = 0 }: KpiCardProps) {
  if (loading) {
    return (
      <Card className="animate-fade-in">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-7 w-24" />
        <Skeleton className="mt-3 h-3.5 w-32" />
      </Card>
    )
  }

  const tendencia = variacion === null || Math.abs(variacion) < 0.05 ? 'neutral' : variacion > 0 ? 'up' : 'down'

  return (
    <Card
      hoverable
      className="group animate-fade-slide-up-sm transition-[box-shadow,transform] duration-200 ease-[var(--ease-premium)] hover:-translate-y-0.5"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-500">{label}</span>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 text-accent-500 transition-[background-color,transform] duration-200 ease-[var(--ease-premium)] group-hover:scale-105 group-hover:bg-accent-100">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-text-900">{valor ?? '—'}</p>
      <p
        className={cn(
          'mt-2 flex items-center gap-1 text-xs font-medium',
          tendencia === 'up' && 'text-success-500',
          tendencia === 'down' && 'text-danger-500',
          tendencia === 'neutral' && 'text-text-500',
        )}
      >
        {tendencia === 'up' && <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />}
        {tendencia === 'down' && <ArrowDownRight className="h-3.5 w-3.5" aria-hidden="true" />}
        {tendencia === 'neutral' && <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
        {variacion === null ? 'Sin período anterior comparable' : `${textoVariacion(variacion, tipoVariacion)} vs. período anterior`}
      </p>
    </Card>
  )
}
