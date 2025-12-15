'use client'
import { TextareaHTMLAttributes, forwardRef } from 'react'
interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> { label?: string; error?: string }
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({ label, error, className = '', id, ...props }, ref) => {
  const textareaId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={textareaId} className="block text-sm font-medium text-cva-gray-700 mb-1">{label}</label>}
      <textarea ref={ref} id={textareaId} className={`w-full px-4 py-2.5 border rounded-lg text-cva-gray-900 placeholder:text-cva-gray-400 focus:outline-none focus:ring-2 focus:ring-cva-green resize-y min-h-[100px] ${error ? 'border-red-500' : 'border-cva-gray-300'} ${className}`} {...props} />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})
TextArea.displayName = 'TextArea'
export default TextArea
