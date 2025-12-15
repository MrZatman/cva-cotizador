'use client'
import { useState, ReactNode } from 'react'
import { Plus, Minus } from 'lucide-react'
interface AccordionItemProps { title: string; subtitle?: string; children: ReactNode; defaultOpen?: boolean }
export function AccordionItem({ title, subtitle, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  return (
    <div className="border border-cva-gray-200 rounded-lg overflow-hidden mb-3">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full flex items-center justify-between px-5 py-4 bg-cva-green text-white hover:bg-cva-green-dark transition-colors">
        <div className="flex flex-col items-start"><span className="font-semibold text-lg">{title}</span>{subtitle && <span className="text-sm text-white/80 mt-0.5">{subtitle}</span>}</div>
        {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
      </button>
      {isOpen && <div className="px-5 py-4 bg-white">{children}</div>}
    </div>
  )
}
export default function Accordion({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={className}>{children}</div>
}
