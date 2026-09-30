import { useSyncExternalStore } from 'react'
import { cn } from '@/utils/cn'

function suscribir(cb: () => void) {
  window.addEventListener('online', cb)
  window.addEventListener('offline', cb)
  return () => {
    window.removeEventListener('online', cb)
    window.removeEventListener('offline', cb)
  }
}

/**
 * Estado del sistema, pequeño y discreto. Refleja la conectividad real del
 * navegador (`navigator.onLine`): "Sistema operativo" o "Sin conexión".
 */
export function SystemStatus() {
  const enLinea = useSyncExternalStore(suscribir, () => navigator.onLine, () => true)
  return (
    <span
      role="status"
      className="hidden items-center gap-1.5 whitespace-nowrap text-xs text-text-500 xl:flex"
      title={enLinea ? 'Conexión activa' : 'Sin conexión a internet'}
    >
      <span
        className={cn('h-1.5 w-1.5 rounded-full', enLinea ? 'bg-accent-line shadow-[0_0_6px_var(--color-accent-line)]' : 'bg-warning-500')}
        aria-hidden="true"
      />
      {enLinea ? 'Sistema operativo' : 'Sin conexión'}
    </span>
  )
}
