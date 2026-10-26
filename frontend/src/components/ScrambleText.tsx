import { useEffect, useState, useRef } from 'react'
import { ASCII_GLYPHS as CHARS } from '../data/theme'

export function ScrambleText({
  text,
  duration = 1400,
  loop = false,
}: {
  text: string
  duration?: number
  loop?: boolean
}) {
  const [displayText, setDisplayText] = useState(text)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    let intervalId: any
    let timeoutId: any
    let observer: IntersectionObserver | null = null

    const runAnimation = () => {
      const start = Date.now()

      intervalId = setInterval(() => {
        const now = Date.now()
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)

        let newText = ''
        for (let i = 0; i < text.length; i++) {
          if (progress >= i / text.length) {
            newText += text[i]
          } else {
            newText += text[i] === ' ' ? ' ' : CHARS[Math.floor(Math.random() * CHARS.length)]
          }
        }

        setDisplayText(newText)

        if (progress === 1) {
          clearInterval(intervalId)
          if (loop) {
            timeoutId = setTimeout(() => {
              runAnimation()
            }, 1000)
          }
        }
      }, 40)
    }

    // Acak huruf baru dimulai saat teks terlihat di layar
    const el = ref.current
    if (el && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) return
        observer?.disconnect()
        runAnimation()
      })
      observer.observe(el)
    } else {
      runAnimation()
    }

    return () => {
      observer?.disconnect()
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [text, duration, loop])

  return <span ref={ref}>{displayText}</span>
}
