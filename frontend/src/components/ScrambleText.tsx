import React, { useEffect, useState, useRef } from 'react'

const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+'

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

    runAnimation()

    return () => {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
    }
  }, [text, duration, loop])

  return <span ref={ref}>{displayText}</span>
}
