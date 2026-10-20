import { useEffect, useRef } from 'react'
import * as THREE from 'three'

/**
 * CONFIG: 3D Wavy Particle Mesh Blob (Contour Lines & Organic Deformed Shell)
 */
const CONFIG = {
  // 36 Cincin kontur paralel, 130 titik per cincin membentuk pita garis bersambung rapi
  numRings: 36,
  pointsPerRing: 130,
  dustCount: 160,

  // Jari-jari dasar bola blob 3D (dinaikkan agar waveform lebih besar)
  baseRadius: 225,

  // Kecepatan animasi santai & sangat halus
  timeSpeed: 0.75,

  // Jangkauan deteksi kursor diperluas agar langsung tanggap (responsif)
  repelRadius: 260,
}

interface ParticleCursorProps {
  className?: string
}

export default function ParticleCursor({ className = '' }: ParticleCursorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const isTouch =
      window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window

    let width = window.innerWidth
    let height = window.innerHeight

    // 1. Camera Orthographic 1:1 piksel
    const camera = new THREE.OrthographicCamera(
      -width * 0.5,
      width * 0.5,
      height * 0.5,
      -height * 0.5,
      -1000,
      1000
    )
    camera.position.z = 500
    camera.lookAt(0, 0, 0)

    // 2. WebGL Renderer
    const dpr = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2)
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(dpr)
    renderer.setSize(width, height)
    renderer.setClearColor(0x000000, 0)

    const scene = new THREE.Scene()

    // 3. Grid Koordinat Cincin Kontur Paralel
    const numRings = isTouch ? 28 : CONFIG.numRings
    const pointsPerRing = isTouch ? 90 : CONFIG.pointsPerRing
    const totalPoints = numRings * pointsPerRing

    const ringCoords = new Float32Array(totalPoints * 2)
    const positions = new Float32Array(totalPoints * 3)

    let ptr = 0
    for (let r = 0; r < numRings; r++) {
      const vNorm = r / (numRings - 1)
      const phi = (vNorm - 0.5) * Math.PI * 0.88

      for (let p = 0; p < pointsPerRing; p++) {
        const theta = (p / pointsPerRing) * Math.PI * 2

        const idx = ptr * 2
        ringCoords[idx] = theta
        ringCoords[idx + 1] = phi

        const pIdx = ptr * 3
        positions[pIdx] = 0
        positions[pIdx + 1] = 0
        positions[pIdx + 2] = 0

        ptr++
      }
    }

    const blobGeometry = new THREE.BufferGeometry()
    blobGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )
    blobGeometry.setAttribute(
      'aRing',
      new THREE.BufferAttribute(ringCoords, 2)
    )

    const uniforms = {
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(-9999, -9999) },
      uMouseStrength: { value: 0 },
      uFocal: { value: new THREE.Vector2(0, 0) },
      uBaseRadius: { value: CONFIG.baseRadius },
      uRepelRadius: { value: CONFIG.repelRadius },
      uDpr: { value: dpr },
    }

    // 4. ShaderMaterial Garis Kontur Wavy Blob 3D
    const blobMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
      uniforms,
      vertexShader: `
        uniform float uTime;
        uniform vec2 uMouse;
        uniform float uMouseStrength;
        uniform vec2 uFocal;
        uniform float uBaseRadius;
        uniform float uRepelRadius;
        uniform float uDpr;

        attribute vec2 aRing; // x: theta, y: phi

        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float theta = aRing.x;
          float phi = aRing.y;

          // DEFORMASI WAVEFORM BLOB KONTINU (Harmonik bertingkat santai):
          float f1 = sin(theta * 2.0 + uTime * 0.85) * cos(phi * 2.0) * 0.22;
          float f2 = cos(theta * 3.0 - uTime * 0.65 + phi * 1.6) * 0.17;
          float f3 = sin(theta + phi * 3.0 - uTime * 1.0) * 0.11;
          
          float rip1 = sin(theta * 5.0 + phi * 3.0 + uTime * 1.2) * 0.08;
          float rip2 = cos(theta * 7.0 - phi * 2.0 - uTime * 0.85) * 0.05;
          
          float totalDisplacement = f1 + f2 + f3 + rip1 + rip2;
          float r = uBaseRadius * (1.0 + totalDisplacement);

          // Koordinat bola dasar 3D
          vec3 p;
          p.x = r * cos(phi) * cos(theta);
          p.y = r * sin(phi);
          p.z = r * cos(phi) * sin(theta);

          // Kemiringan 3D pitch ~22 derajat
          float tiltX = 0.38;
          float cX = cos(tiltX);
          float sX = sin(tiltX);
          vec3 rotP;
          rotP.x = p.x;
          rotP.y = p.y * cX - p.z * sX;
          rotP.z = p.y * sX + p.z * cX;

          // Rotasi yaw santai
          float yawY = uTime * 0.12;
          float cY = cos(yawY);
          float sY = sin(yawY);
          vec3 finalP;
          finalP.x = rotP.x * cY + rotP.z * sY;
          finalP.y = rotP.y;
          finalP.z = -rotP.x * sY + rotP.z * cY;

          vec3 worldP = finalP + vec3(uFocal, 0.0);

          // INTERAKSI KURSOR: Transisi halus & sedikit pelan (velvety smooth wave)
          vec2 dMouse = worldP.xy - uMouse;
          float distMouse = length(dMouse);
          
          if (distMouse < uRepelRadius && uMouseStrength > 0.001) {
            float normDist = distMouse / uRepelRadius; // 0.0 di kursor, 1.0 di batas luar
            
            // Transisi batas luar halus tanpa hentakan mendadak
            float falloff = smoothstep(1.0, 0.0, normDist);
            
            // Easing kuadratik lembut mengalir pelan santai
            float smoothWave = sin(falloff * 1.5707963);
            smoothWave = smoothWave * smoothWave;
            
            float pushAmount = smoothWave * 95.0 * uMouseStrength;
            
            vec2 pushDir = distMouse > 0.1 ? dMouse / distMouse : vec2(0.0, 1.0);
            worldP.xy += pushDir * pushAmount;
            worldP.z -= pushAmount * 0.45;
          }

          // GRADASI HORIZONTAL PERSIS SEPERTI GAMBAR CONTOH:
          float uNorm = clamp((finalP.x / (uBaseRadius * 1.3) + 1.0) * 0.5, 0.0, 1.0);
          
          vec3 cTeal = vec3(0.031, 0.569, 0.698);    // #0891b2 Stabilo Cyan
          vec3 cBlue = vec3(0.145, 0.388, 0.922);    // #2563eb Primary Blue
          vec3 cMagenta = vec3(0.635, 0.145, 0.553); // #a2258d Magenta
          vec3 cCoral = vec3(0.882, 0.114, 0.282);   // #e11d48 Coral Ruby
          vec3 cPeach = vec3(0.918, 0.345, 0.047);   // #ea580c Orange Sunset
          vec3 cYellow = vec3(0.980, 0.800, 0.082);  // #facc15 Stabilo Yellow

          vec3 col;
          if (uNorm < 0.20) {
            col = mix(cTeal, cBlue, uNorm / 0.20);
          } else if (uNorm < 0.42) {
            col = mix(cBlue, cMagenta, (uNorm - 0.20) / 0.22);
          } else if (uNorm < 0.64) {
            col = mix(cMagenta, cCoral, (uNorm - 0.42) / 0.22);
          } else if (uNorm < 0.84) {
            col = mix(cCoral, cPeach, (uNorm - 0.64) / 0.20);
          } else {
            col = mix(cPeach, cYellow, (uNorm - 0.84) / 0.16);
          }

          // Kedalaman rongga 3D: Dinding depan cerah (tebal), dinding belakang lembut (tipis)
          float zDepth = clamp((finalP.z / uBaseRadius + 1.0) * 0.5, 0.0, 1.0);
          vColor = col * (0.8 + 0.4 * zDepth);
          vAlpha = mix(0.24, 0.90, zDepth);

          gl_PointSize = mix(1.6, 2.7, zDepth) * uDpr;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(worldP, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          vec2 coord = gl_PointCoord - vec2(0.5);
          float dist = length(coord);
          if (dist > 0.5) discard;
          
          float alpha = smoothstep(0.5, 0.35, dist) * vAlpha;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
    })

    const blobPoints = new THREE.Points(blobGeometry, blobMaterial)
    scene.add(blobPoints)

    // 5. Titik Debu Ambien
    const dustCount = isTouch ? Math.round(CONFIG.dustCount * 0.5) : CONFIG.dustCount
    const dustGeometry = new THREE.BufferGeometry()
    const dustPositions = new Float32Array(dustCount * 3)
    const dustHomeX = new Float32Array(dustCount)
    const dustHomeY = new Float32Array(dustCount)
    const dustPhases = new Float32Array(dustCount)

    for (let j = 0; j < dustCount; j++) {
      const angle = Math.random() * Math.PI * 2
      const dist = (0.4 + Math.random() * 1.5) * CONFIG.baseRadius * 1.4
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist
      dustHomeX[j] = dx
      dustHomeY[j] = dy
      dustPhases[j] = Math.random() * Math.PI * 2

      const idx = j * 3
      dustPositions[idx] = dx
      dustPositions[idx + 1] = dy
      dustPositions[idx + 2] = (Math.random() - 0.5) * 80
    }
    dustGeometry.setAttribute(
      'position',
      new THREE.BufferAttribute(dustPositions, 3)
    )

    const dotCanvas = document.createElement('canvas')
    dotCanvas.width = 16
    dotCanvas.height = 16
    const dotCtx = dotCanvas.getContext('2d')
    if (dotCtx) {
      dotCtx.beginPath()
      dotCtx.arc(8, 8, 7, 0, Math.PI * 2)
      dotCtx.fillStyle = '#ffffff'
      dotCtx.fill()
    }
    const dotTexture = new THREE.CanvasTexture(dotCanvas)

    const dustMaterial = new THREE.PointsMaterial({
      color: 0x94a3b8,
      size: 1.5,
      transparent: true,
      opacity: 0.35,
      map: dotTexture,
      depthWrite: false,
    })
    const dustPoints = new THREE.Points(dustGeometry, dustMaterial)
    scene.add(dustPoints)

    // 6. Pusat Focal & Tracking Kursor Responsif Cepat
    let focalX = 0
    let focalY = 0

    const mouse = {
      x: -9999,
      y: -9999,
      targetX: -9999,
      targetY: -9999,
      active: false,
      strength: 0,
    }

    const onPointerMove = (e: PointerEvent) => {
      mouse.targetX = e.clientX - width * 0.5
      mouse.targetY = -(e.clientY - height * 0.5)
      mouse.active = true
    }

    const onPointerLeave = () => {
      mouse.active = false
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })

    const handleResize = () => {
      const newW = window.innerWidth
      const newH = window.innerHeight
      if (newW <= 0 || newH <= 0) return

      width = newW
      height = newH

      camera.left = -width * 0.5
      camera.right = width * 0.5
      camera.top = height * 0.5
      camera.bottom = -height * 0.5
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
      uniforms.uDpr.value = Math.min(window.devicePixelRatio || 1, isTouch ? 1.5 : 2)
    }

    window.addEventListener('resize', handleResize, { passive: true })

    let isVisible = true
    const onVisibilityChange = () => {
      isVisible = !document.hidden
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    // 7. Animation Loop
    let animationFrameId: number

    const animate = (currentTime: number) => {
      animationFrameId = requestAnimationFrame(animate)

      if (!isVisible) return

      const t = currentTime * 0.001 * CONFIG.timeSpeed

      // Tracking kekuatan tolak & koordinat kursor halus & sedikit pelan
      if (mouse.active) {
        if (mouse.x < -9000) {
          mouse.x = mouse.targetX
          mouse.y = mouse.targetY
        } else {
          // Lerp halus meluncur santai tanpa sentakan mendadak
          mouse.x += (mouse.targetX - mouse.x) * 0.08
          mouse.y += (mouse.targetY - mouse.y) * 0.08
        }
        mouse.strength += (1.0 - mouse.strength) * 0.05
      } else {
        mouse.strength *= 0.92
      }

      // Pergerakan pusat blob mengikuti kursor:
      // Amplitudo dinaikkan ke 0.55, lerp mengalir smooth 0.09
      const targetFocalX = mouse.active ? mouse.x * 0.55 : 0
      const targetFocalY = mouse.active ? mouse.y * 0.55 : 0
      focalX += (targetFocalX - focalX) * 0.09
      focalY += (targetFocalY - focalY) * 0.09

      uniforms.uTime.value = t
      uniforms.uMouse.value.set(mouse.x, mouse.y)
      uniforms.uMouseStrength.value = mouse.strength
      uniforms.uFocal.value.set(focalX, focalY)

      const dustPos = dustGeometry.attributes.position.array as Float32Array
      for (let j = 0; j < dustCount; j++) {
        const idx = j * 3
        dustPos[idx] =
          focalX + dustHomeX[j] + Math.cos(t * 0.4 + dustPhases[j]) * 5
        dustPos[idx + 1] =
          focalY + dustHomeY[j] + Math.sin(t * 0.4 + dustPhases[j]) * 5
      }
      dustGeometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
    }

    animationFrameId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)

      scene.remove(blobPoints)
      scene.remove(dustPoints)

      blobGeometry.dispose()
      blobMaterial.dispose()
      dustGeometry.dispose()
      dustMaterial.dispose()
      dotTexture.dispose()

      renderer.dispose()
    }
  }, [])

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 pointer-events-none overflow-hidden z-[1] ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full pointer-events-none"
      />
    </div>
  )
}
