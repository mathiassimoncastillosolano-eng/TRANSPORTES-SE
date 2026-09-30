import { LoginBrandPanel } from './components/LoginBrandPanel'
import { LoginForm } from './components/LoginForm'

/**
 * Primera pantalla de la aplicación cuando no hay sesión (`authStore.status
 * === 'unauthenticated'`). No monta Sidebar, Header ni ninguna sección del
 * Shell — `ProtectedRoute` la renderiza en su lugar.
 *
 * Layout: panel visual (branding) + formulario, lado a lado desde `lg`. En
 * pantallas angostas el panel visual se reemplaza por un lockup compacto
 * arriba del formulario, para priorizar el formulario sin scroll vertical.
 */
export function LoginView() {
  return (
    <div className="flex h-screen min-h-[640px] w-full overflow-hidden bg-surface lg:h-screen">
      <div className="hidden w-[46%] shrink-0 lg:block xl:w-[50%]">
        <LoginBrandPanel />
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Lockup compacto: solo visible por debajo de `lg`, sustituye al panel visual completo. */}
        <div className="flex items-center gap-2.5 border-b border-border bg-[linear-gradient(155deg,var(--color-ink-950),var(--color-ink-900))] px-6 py-4 lg:hidden">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500 text-sm font-semibold text-ink-950">
            R
          </span>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold tracking-tight text-white" style={{ fontFamily: 'var(--font-display)' }}>
              RutaLibre
            </p>
            <p className="text-[11px] text-ink-300">Sistema Empresarial</p>
          </div>
        </div>

        <div className="flex flex-1 items-start justify-center px-6 py-10 sm:px-10 lg:items-center">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
