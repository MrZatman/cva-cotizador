'use client'
import { Loader2 } from 'lucide-react'
export default function Loading({ text, fullScreen = false }: { text?: string; fullScreen?: boolean }) {
  const content = <div className="flex flex-col items-center justify-center gap-3"><Loader2 className="w-8 h-8 text-cva-green animate-spin" />{text && <p className="text-cva-gray-600 text-sm">{text}</p>}</div>
  if (fullScreen) return <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">{content}</div>
  return <div className="flex items-center justify-center py-8">{content}</div>
}
