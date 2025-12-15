'use client'
import { SelectHTMLAttributes, forwardRef } from 'react'
import { ChevronDown } from 'lucide-react'
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> { label?: string; error?: string; options: { value: string; label: string }[]; placeholder?: string }
const Select = forwardRef<HTMLSelectElement, SelectProps>(({ label, error, options, placeholder = 'Selecciona...', className = '', id, ...props }, ref) => {
  const selectId = id || label?.toLowerCase().replace(/\s/g, '-')
  return (
    <div className="w-full">
      {label && <label htmlFor={selectId} className="block text-sm font-medium text-cva-gray-700 mb-1">{label}{props.required && <span className="text-red-500 ml-1">*</span>}</label>}
      <div className="relative">
        <select ref={ref} id={selectId} className={`w-full px-4 py-2.5 border rounded-lg text-cva-gray-900 bg-white appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cva-green ${error ? 'border-red-500' : 'border-cva-gray-300'} ${className}`} {...props}>
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cva-gray-400 pointer-events-none" />
      </div>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
})
Select.displayName = 'Select'
export default Select
