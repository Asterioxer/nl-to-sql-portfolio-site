import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'

// A field of slowly-drifting points connected by a faint schema-like
// lattice feel — evokes "structured data floating in space" without
// being a literal, distracting illustration. Cheap to render (single
// Points object, no post-processing) so it's safe as a full-bleed
// hero background even on modest hardware.
function ParticleField({ count = 500 }) {
  const pointsRef = useRef()

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 18
      arr[i * 3 + 1] = (Math.random() - 0.5) * 10
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [count])

  useFrame((state) => {
    if (!pointsRef.current) return
    const t = state.clock.getElapsedTime()
    pointsRef.current.rotation.y = t * 0.015
    pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.045}
        color="#7c9cff"
        transparent
        opacity={0.65}
        sizeAttenuation
      />
    </points>
  )
}

export default function ThreeBackground({ className = '' }) {
  return (
    <div className={`three-bg ${className}`} aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 6], fov: 55 }} dpr={[1, 1.5]}>
        <ParticleField />
      </Canvas>
    </div>
  )
}
