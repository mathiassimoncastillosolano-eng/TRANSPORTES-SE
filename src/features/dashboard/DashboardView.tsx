import { Building2, Gauge, Receipt, Route as RouteIcon, Ticket, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { PageContainer } from '@/components/navigation/PageContainer'
import { useCatalogo } from '@/hooks/useCatalogo'
import { formatearFecha, formatearMoneda, formatearNumero, formatearPorcentaje } from '@/utils/formato'
import { DashboardFilters } from './components/DashboardFilters'
import { EvolutionChart } from './components/EvolutionChart'
import { KpiCard } from './components/KpiCard'
import { RankingPanel } from './components/RankingPanel'
import { ServiceDistribution } from './components/ServiceDistribution'
import { useDashboardData } from './hooks/useDashboardData'
import { useDashboardFilters } from './hooks/useDashboardFilters'
import type { KpiId } from './utils/agregaciones'
import { resolverRango } from './utils/periodos'

const KPI_INFO: Record<KpiId, { label: string; icon: LucideIcon; formatear: (v: number) => string }> = {
  ingresos: { label: 'Ingresos', icon: Wallet, formatear: formatearMoneda },
  pasajes: { label: 'Pasajes vendidos', icon: Ticket, formatear: formatearNumero },
  ocupacion: { label: 'Ocupación promedio', icon: Gauge, formatear: (v) => formatearPorcentaje(v) },
  ticket: { label: 'Ticket promedio', icon: Receipt, formatear: formatearMoneda },
  viajes: { label: 'Viajes con ventas', icon: RouteIcon, formatear: formatearNumero },
  agencias: { label: 'Agencias activas', icon: Building2, formatear: formatearNumero },
}
const ORDEN_KPI: KpiId[] = ['ingresos', 'pasajes', 'ocupacion', 'ticket', 'viajes', 'agencias']

/** Dashboard empresarial: KPIs, gráficos y rankings recalculados con los filtros, desde los mismos datos del registro. */
export function DashboardView() {
  const { filtros, errorRango, consulta, hayCambios, actualizar, limpiar } = useDashboardFilters()
  const { catalogo } = useCatalogo()
  const { datos, cargando, error, reintentar } = useDashboardData(consulta, catalogo?.agencias ?? [], catalogo?.servicios ?? [])
  const rango = resolverRango(filtros)
  const cargandoTodo = cargando || !catalogo

  return (
    <PageContainer
      title="Dashboard"
      description={`Ventas del ${formatearFecha(rango.desde)} al ${formatearFecha(rango.hasta)}. Las variaciones comparan con el período anterior de igual duración.`}
    >
      <DashboardFilters filtros={filtros} catalogo={catalogo} errorRango={errorRango} hayCambios={hayCambios} onChange={actualizar} onClear={limpiar} />

      <section aria-label="Indicadores" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ORDEN_KPI.map((id, i) => {
          const info = KPI_INFO[id]
          const kpi = datos?.kpis.find((k) => k.id === id)
          return (
            <KpiCard
              key={id}
              label={info.label}
              icon={info.icon}
              loading={cargandoTodo || (!datos && !error)}
              valor={kpi && kpi.valor !== null ? info.formatear(kpi.valor) : null}
              variacion={kpi?.variacion ?? null}
              tipoVariacion={kpi?.tipoVariacion ?? 'porcentaje'}
              delayMs={i * 50}
            />
          )
        })}
      </section>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <EvolutionChart serie={datos?.serie ?? []} cargando={cargandoTodo} error={error} onRetry={reintentar} hayVentas={datos?.hayVentas ?? false} />
        <ServiceDistribution filas={datos?.porServicio ?? []} cargando={cargandoTodo} error={error} onRetry={reintentar} hayVentas={datos?.hayVentas ?? false} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <RankingPanel
          title="Ranking de agencias"
          description="Ingresos por agencia de venta"
          encabezado="Agencia"
          filas={datos?.porAgencia ?? []}
          cargando={cargandoTodo}
          error={error}
          onRetry={reintentar}
          hayVentas={datos?.hayVentas ?? false}
          etiquetaCorta={(e) => e.replace(/^Terminal( Terrestre)? /, '')}
          anchoEtiqueta={92}
        />
        <RankingPanel
          title="Ranking de rutas"
          description="Ingresos por ruta (origen → destino)"
          encabezado="Ruta"
          filas={datos?.porRuta ?? []}
          cargando={cargandoTodo}
          error={error}
          onRetry={reintentar}
          hayVentas={datos?.hayVentas ?? false}
          anchoEtiqueta={130}
        />
      </div>
    </PageContainer>
  )
}
