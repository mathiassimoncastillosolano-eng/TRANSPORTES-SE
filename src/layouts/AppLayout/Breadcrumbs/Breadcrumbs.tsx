import { ChevronRight } from 'lucide-react'
import { findNavContext, SECCION_INICIAL } from '@/config/navigation'
import { useUIStore } from '@/stores/uiStore'

/**
 * Migas de pan "RutaLibre › Grupo › Página", generadas desde `navigationConfig`
 * (cualquier módulo nuevo obtiene su miga sin configuración extra). No usa
 * rutas: solo lee/escribe `activeSectionId` en `uiStore`.
 */
export function Breadcrumbs() {
  const activeSectionId = useUIStore((s) => s.activeSectionId)
  const setActiveSection = useUIStore((s) => s.setActiveSection)
  const contexto = findNavContext(activeSectionId)

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
      <button
        type="button"
        onClick={() => setActiveSection(SECCION_INICIAL)}
        className="font-medium text-text-500 transition-colors hover:text-text-900"
      >
        RutaLibre
      </button>
      {contexto?.sectionLabel && (
        <>
          <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-400" aria-hidden="true" />
          <span className="hidden truncate text-text-500 md:inline">{contexto.sectionLabel}</span>
          <ChevronRight className="hidden h-3.5 w-3.5 shrink-0 text-text-400 md:block" aria-hidden="true" />
        </>
      )}
      {!contexto?.sectionLabel && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-text-400" aria-hidden="true" />}
      <span className="truncate font-medium text-text-900" aria-current="page">
        {contexto?.item.title ?? 'Sección'}
      </span>
    </nav>
  )
}
