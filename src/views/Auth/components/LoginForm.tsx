import { useRef, useState, type FormEvent } from 'react'
import { AlertCircle, Eye, EyeOff, Lock, Mail, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Checkbox } from '@/components/ui/Checkbox'
import { Input } from '@/components/ui/Input'
import { useAuthStore, demoCredentials } from '@/stores/authStore'
import { useToastStore } from '@/stores/toastStore'

const RECORDAR_KEY = 'rutalibre-se-remember-email'

/**
 * Formulario del login. Toda la lógica de credenciales vive aquí; el panel
 * visual (`LoginBrandPanel`) es puramente decorativo y no la conoce.
 */
export function LoginForm() {
  const login = useAuthStore((s) => s.login)
  const pushToast = useToastStore((s) => s.push)

  const [email, setEmail] = useState(() => window.localStorage.getItem(RECORDAR_KEY) ?? '')
  const [password, setPassword] = useState('')
  const [recordar, setRecordar] = useState(() => !!window.localStorage.getItem(RECORDAR_KEY))
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const passwordRef = useRef<HTMLInputElement>(null)

  async function enviar(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    setEnviando(true)
    const resultado = await login(email, password)
    setEnviando(false)

    if (!resultado.ok) {
      setError(resultado.message)
      setPassword('')
      window.requestAnimationFrame(() => passwordRef.current?.focus())
      return
    }

    if (recordar) window.localStorage.setItem(RECORDAR_KEY, email.trim())
    else window.localStorage.removeItem(RECORDAR_KEY)
  }

  function autocompletarDemo() {
    setEmail(demoCredentials.email)
    setPassword(demoCredentials.password)
    setError(null)
  }

  /** Solo se usa en los `onChange` de los campos: limpia el error cuando la persona vuelve a escribir (no cuando el propio envío resetea el campo). */
  function editar(setter: (v: string) => void) {
    return (valor: string) => {
      setter(valor)
      setError(null)
    }
  }

  function problemasParaAcceder() {
    pushToast({
      tone: 'info',
      title: 'Contacta a tu administrador',
      description: 'Tu administrador de agencia puede restablecer el acceso a tu cuenta.',
    })
  }

  return (
    <div className="w-full max-w-[380px] animate-fade-slide-up">
      <div className="mb-8">
        <h1
          className="text-[26px] font-semibold tracking-tight text-text-900"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          Bienvenido de nuevo
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-500">
          Ingresa tus credenciales para acceder al Sistema Empresarial de RutaLibre.
        </p>
      </div>

      <form noValidate onSubmit={enviar} className="flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="animate-fade-slide-up-sm flex items-start gap-2.5 rounded-lg border border-danger-500/30 bg-danger-50 px-3.5 py-3 text-sm text-danger-500"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <p>{error}</p>
          </div>
        )}

        <Input
          id="login-email"
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          placeholder="nombre.apellido@rutalibre.com"
          required
          invalid={!!error}
          iconLeft={<Mail className="h-4 w-4" aria-hidden="true" />}
          value={email}
          onChange={(e) => editar(setEmail)(e.target.value)}
        />

        <Input
          id="login-password"
          ref={passwordRef}
          label="Contraseña"
          type={mostrarPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder="••••••••"
          required
          invalid={!!error}
          iconLeft={<Lock className="h-4 w-4" aria-hidden="true" />}
          trailing={
            <button
              type="button"
              onClick={() => setMostrarPassword((v) => !v)}
              aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={mostrarPassword}
              className="flex h-6 w-6 items-center justify-center rounded text-text-400 transition-colors hover:text-text-700"
            >
              {mostrarPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          }
          value={password}
          onChange={(e) => editar(setPassword)(e.target.value)}
        />

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            label="Recordarme"
            checked={recordar}
            onChange={(e) => setRecordar(e.target.checked)}
          />
          <button
            type="button"
            onClick={problemasParaAcceder}
            className="text-sm font-medium text-route-500 transition-colors hover:text-route-600 dark:hover:text-route-400"
          >
            ¿Problemas para acceder?
          </button>
        </div>

        <Button type="submit" size="lg" loading={enviando} className="mt-1 w-full">
          {enviando ? 'Iniciando sesión…' : 'Iniciar sesión'}
        </Button>
      </form>

      <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-dashed border-border-strong bg-surface-sunken/60 px-3.5 py-3">
        <Wand2 className="mt-0.5 h-4 w-4 shrink-0 text-text-400" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-700">Cuenta de demostración</p>
          <p className="mt-0.5 truncate text-xs text-text-500">{demoCredentials.email}</p>
        </div>
        <button
          type="button"
          onClick={autocompletarDemo}
          className="shrink-0 text-xs font-medium text-accent-600 transition-colors hover:text-accent-500"
        >
          Autocompletar
        </button>
      </div>
    </div>
  )
}
