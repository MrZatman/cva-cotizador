'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, Input } from '@/components/ui'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
export default function RecuperarPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
      if (error) { toast.error(error.message); return }
      setSent(true)
      toast.success('Se ha enviado el enlace')
    } catch (e) { toast.error('Error. Intenta de nuevo.') }
    finally { setLoading(false) }
  }
  if (sent) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="w-8 h-8 text-green-600" /></div>
        <h1 className="text-2xl font-semibold mb-2">¡Revisa tu correo!</h1>
        <p className="text-cva-gray-600 mb-6">Hemos enviado un enlace a <strong>{email}</strong>.</p>
        <Link href="/login"><Button variant="secondary" fullWidth><ArrowLeft className="w-4 h-4 mr-2" />Volver al login</Button></Link>
      </div>
    </div>
  )
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4">
      <div className="mb-8"><div className="w-20 h-20 bg-cva-green rounded-xl flex items-center justify-center mx-auto"><span className="text-white font-bold text-2xl">CVA</span></div></div>
      <h1 className="text-2xl font-semibold mb-2">Recuperar acceso</h1>
      <p className="text-cva-gray-600 mb-8 text-center max-w-sm">Ingresa tu email y te enviaremos un enlace.</p>
      <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
        <Input type="email" placeholder="Tu email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <Button type="submit" loading={loading} fullWidth size="lg">Enviar enlace</Button>
      </form>
      <Link href="/login" className="mt-6 text-cva-gray-600 hover:text-cva-green text-sm flex items-center gap-1"><ArrowLeft className="w-4 h-4" />Volver al login</Link>
    </div>
  )
}
