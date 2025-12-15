'use client'
import { InputHTMLAttributes, forwardRef } from 'react'
interface InputProps extends InputHTMLAttributes<HTMLInputElement> { label?: string; error?: string; helperText?: string }
const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, helperText, className = '', id, ...props }, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={inputId} className="block text-sm font-medium text-cva-gray-700 mb-1">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
      <input ref={ref} id={inputId} className={`w-full px-4 py-2.5 border rounded-lg text-cva-gray-900 placeholder:text-cva-gray-400 focus:outline-none focus:ring-2 focus:ring-cva-green focus:border-transparent disabled:bg-cva-gray-100 ${error ? 'border-red-500' : 'border-cva-gray-300 hover:border-cva-gray-400'} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="mt-1 text-sm text-cva-gray-500">{helperText}</p>}
    </div>
  )
})
Input.displayName = 'Input'
export default Input
