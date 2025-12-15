'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'
import toast from 'react-hot-toast'
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) { toast.error(error.message.includes('Invalid') ? 'Email o contraseña incorrectos' : error.message); return }
      toast.success('¡Bienvenido!')
      router.push('/cotizaciones')
      router.refresh()
    } catch (e) { toast.error('Error al iniciar sesión') }
    finally { setLoading(false) }
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-8"><div className="w-20 h-20 bg-cva-green rounded-xl flex items-center justify-center mx-auto"><span className="text-white font-bold text-2xl">CVA</span></div><p className="text-center text-sm text-cva-gray-500 mt-2">SYSTEMS</p></div>
      <div className="w-full max-w-md border-t border-cva-gray-200 mb-8"></div>
      <h1 className="font-display text-5xl italic text-cva-green mb-2">Cotizador</h1>
      <p className="text-cva-gray-600 mb-8">Ingresa con tu acceso autorizado</p>
      <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
        <Input type="email" placeholder="Usuario o email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className="text-center" />
        <Input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className="text-center" />
        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-6">Entrar</Button>
      </form>
      <Link href="/recuperar" className="mt-6 text-cva-green hover:text-cva-green-dark text-sm font-medium">¿Olvidaste tu acceso?</Link>
    </div>
  )
}
