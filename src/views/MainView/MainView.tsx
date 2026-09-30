import { useUIStore } from '@/stores/uiStore'
import { renderSection } from './SectionRegistry'

/**
 * Pantalla principal única de la aplicación.
 *
 * La app no tiene páginas ni rutas por módulo: el Sidebar cambia
 * `activeSectionId` en `uiStore`, y esta Main View renderiza la
 * sección correspondiente a partir de `SectionRegistry`. Esto
 * mantiene toda la navegación dentro de una sola pantalla, tal como
 * lo requiere la arquitectura del Shell.
 */
export function MainView() {
  const activeSectionId = useUIStore((s) => s.activeSectionId)

  // `key` fuerza un remount al cambiar de sección, lo que reinicia la
  // animación de entrada (fade + translate) definida en `index.css`. Es una
  // transición "entre vistas" barata de lograr sin router: no hay estado que
  // preservar entre secciones (cada una ya guarda el suyo en su propio store).
  return (
    <div key={activeSectionId} className="animate-fade-slide-up flex flex-col gap-6">
      {renderSection(activeSectionId)}
    </div>
  )
}
