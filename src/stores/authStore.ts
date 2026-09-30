import { create } from 'zustand'
import type { AuthSession, AuthUser, Permission } from '@/types/auth'

/**
 * Store de sesión. Autenticación 100% simulada (sin backend, sin JWT real):
 * un único usuario mock con rol trabajador (`staff`) y permisos acotados a
 * las capacidades del MVP.
 *
 * `status` representa el ciclo de vida real de la sesión:
 *   'loading'         -> verificando si ya existe una sesión (al abrir la app)
 *   'unauthenticated' -> no hay sesión: se muestra el Login
 *   'authenticated'   -> hay sesión: se muestra el Shell (Sidebar/Header/SE)
 *
 * La sesión se guarda en `sessionStorage` (no `localStorage`): sobrevive a
 * un refresh de la pestaña, como cualquier sesión real, pero no persiste
 * entre reinicios del navegador ni es la sesión "de negocio" del MVP — es
 * solo la marca de "hay alguien logueado", igual que una cookie de sesión.
 * Como la app no tiene rutas (una sola Main View), no existe una URL del
 * shell a la que el botón "atrás" del navegador pueda regresar tras el
 * logout: `ProtectedRoute` ya decide qué mostrar únicamente a partir de
 * este `status`.
 */

const SESSION_KEY = 'rutalibre-se-session'
const RETRASO_VERIFICACION_MS = 450
const RETRASO_LOGIN_MS = 700

const permisosTrabajador: Permission[] = ['pasajes:registrar', 'dashboard:ver']

const mockUser: AuthUser = {
  id: 'usr_demo_1',
  name: 'Camila Rojas',
  email: 'camila.rojas@rutalibre.com',
  role: 'staff',
  permissions: permisosTrabajador,
  agenciaId: 'lim-norte',
}

/**
 * Credenciales de la cuenta de demostración. Se validan aquí (no hay
 * backend), y deliberadamente NO se imprimen en ningún texto de la UI: el
 * botón "Usar cuenta de demostración" del login las autocompleta sin
 * revelarlas como texto plano. Ver README para probarlas manualmente.
 */
const DEMO_EMAIL = mockUser.email
const DEMO_PASSWORD = 'RutaLibre#2026'

export type LoginResult = { ok: true } | { ok: false; message: string }

interface AuthStoreState extends AuthSession {
  /** Comprueba si ya existe una sesión (sessionStorage) y resuelve el estado inicial. Se llama una sola vez al montar la app. */
  init: () => void
  login: (email: string, password: string) => Promise<LoginResult>
  logout: () => void
}

function esperar(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export const useAuthStore = create<AuthStoreState>()((set) => ({
  user: null,
  status: 'loading',

  init: () => {
    const haySesion = window.sessionStorage.getItem(SESSION_KEY) === mockUser.id
    // Pequeño retraso solo cuando hay sesión que "verificar": si no la hay,
    // resolver de inmediato evita una espera artificial en la primera visita.
    esperar(haySesion ? RETRASO_VERIFICACION_MS : 0).then(() => {
      set(haySesion ? { user: mockUser, status: 'authenticated' } : { user: null, status: 'unauthenticated' })
    })
  },

  login: async (email, password) => {
    await esperar(RETRASO_LOGIN_MS)
    const coincide =
      email.trim().toLowerCase() === DEMO_EMAIL.toLowerCase() && password === DEMO_PASSWORD
    if (!coincide) {
      return { ok: false, message: 'Correo o contraseña incorrectos. Verifica tus datos e inténtalo de nuevo.' }
    }
    window.sessionStorage.setItem(SESSION_KEY, mockUser.id)
    set({ user: mockUser, status: 'authenticated' })
    return { ok: true }
  },

  logout: () => {
    window.sessionStorage.removeItem(SESSION_KEY)
    set({ user: null, status: 'unauthenticated' })
  },
}))

/** Credenciales de demostración, solo para autocompletar el formulario (nunca se renderizan como texto). */
export const demoCredentials = { email: DEMO_EMAIL, password: DEMO_PASSWORD }

/** `'*'` concede todo; sin permiso requerido siempre se permite. */
export function hasPermission(user: AuthUser | null, required?: string): boolean {
  if (!required) return true
  if (!user) return false
  return user.permissions.includes('*') || user.permissions.includes(required)
}
