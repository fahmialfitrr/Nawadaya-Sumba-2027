import React, { type ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface ButtonProps {
  children: ReactNode
  variant?: 'white' | 'ghost' | 'yellow'
  icon?: LucideIcon
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

export function Button({
  children,
  variant = 'white',
  icon: Icon,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
}: ButtonProps) {
  const baseStyles =
    "flex gap-[6px] md:gap-[8px] items-center justify-center overflow-hidden px-[14px] py-[8px] md:px-[20px] md:py-[10px] relative rounded-full font-inter font-medium leading-[20px] md:leading-[24px] text-[13.2px] md:text-[13.2px] whitespace-nowrap transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    white: "bg-white text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 hover:shadow hover:-translate-y-0.5",
    ghost: "bg-slate-200/50 text-slate-700 hover:bg-slate-200 hover:-translate-y-0.5",
    yellow: "bg-[#ffab2f] text-slate-900 border border-[#ffab2f] shadow-[0px_1px_2px_0px_rgba(16,24,40,0.05)] hover:bg-[#e69b2a] hover:border-[#e69b2a] hover:shadow-md hover:-translate-y-0.5 font-medium",
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
      {Icon && <Icon className="w-[18px] h-[18px]" />}
    </button>
  )
}
