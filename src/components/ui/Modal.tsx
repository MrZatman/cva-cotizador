'use client'
import { useEffect, useRef, ReactNode } from 'react'
import { X } from 'lucide-react'
interface ModalProps { isOpen: boolean; onClose: () => void; title?: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl' }
export default function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) { document.addEventListener('keydown', handleEscape); document.body.style.overflow = 'hidden' }
    return () => { document.removeEventListener('keydown', handleEscape); document.body.style.overflow = 'unset' }
  }, [isOpen, onClose])
  if (!isOpen) return null
  const sizes = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg', xl: 'max-w-xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={(e) => { if (modalRef.current && !modalRef.current.contains(e.target as Node)) onClose() }}>
      <div ref={modalRef} className={`${sizes[size]} w-full bg-white rounded-xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col`}>
        {title && <div className="flex items-center justify-between px-6 py-4 border-b"><h2 className="text-xl font-semibold">{title}</h2><button onClick={onClose} className="p-1 hover:bg-cva-gray-100 rounded-full"><X className="w-5 h-5" /></button></div>}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
      </div>
    </div>
  )
}
