'use client'
import { ReactNode } from 'react'
export default function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl shadow-sm border border-cva-gray-200 p-5 ${className}`}>{children}</div>
}
