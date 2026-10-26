import { useRef, type ReactNode } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import AsciiVeil from './AsciiVeil'

interface ScrollPhotoProps {
  src: string
  alt: string
  className?: string
  /** Pergeseran parallax dalam persen tinggi foto (0 = tanpa parallax) */
  strength?: number
  /** Foto terbentuk dari tirai ASCII saat pertama masuk layar */
  reveal?: boolean
  /** Warna tirai ASCII, samakan dengan latar di sekitar foto */
  veil?: string
  delay?: number
  eager?: boolean
  children?: ReactNode
}

export function ScrollPhoto({
  src,
  alt,
  className = '',
  strength = 8,
  reveal = true,
  veil,
  delay = 0,
  eager = false,
  children,
}: ScrollPhotoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], [`-${strength}%`, `${strength}%`])
  const animate = !reduce

  return (
    <div ref={ref} className={`relative overflow-hidden bg-ink-800 ${className}`}>
      <motion.img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        style={animate && strength > 0 ? { y, scale: 1 + (strength * 2.2) / 100 } : undefined}
        className="absolute inset-0 w-full h-full object-cover"
      />
      {children}
      {reveal && <AsciiVeil color={veil} delay={delay} />}
    </div>
  )
}

/** Fade + naik saat masuk layar, untuk teks dan kartu */
export function Reveal({
  children,
  className = '',
  delay = 0,
  y = 28,
}: {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
}) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  )
}
