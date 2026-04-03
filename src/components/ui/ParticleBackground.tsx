'use client'

import { useEffect, useRef } from 'react'

export function ParticleBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        if (!ctx) return

        let particlesArray: any[] = []
        let animationFrameId: number
        let cx = 0
        let cy = 0
        let isVisible = true

        // Intersection Observer para NO animar cuando no se ve en pantalla (ahorra 90% CPU)
        const observer = new IntersectionObserver((entries) => {
            if (entries[0]) {
                isVisible = entries[0].isIntersecting
            }
        }, { threshold: 0 })
        observer.observe(canvas)

        // Mouse radius: cuán lejos interactúa con los puntos
        const mouse = {
            x: -1000,
            y: -1000,
            radius: 150 // Aumentamos radio de interacción
        }

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect()
            mouse.x = e.clientX - rect.left
            mouse.y = e.clientY - rect.top
        }

        const handleMouseLeave = () => {
            mouse.x = -1000
            mouse.y = -1000
        }

        // Detectar si estamos sobre toda la tarjeta del artista para activar el efecto
        const container = canvas.closest('.group') || window
        container.addEventListener('mousemove', handleMouseMove as any)
        container.addEventListener('mouseleave', handleMouseLeave as any)

        const resize = () => {
            if (canvas.parentElement) {
                canvas.width = canvas.parentElement.clientWidth
                canvas.height = canvas.parentElement.clientHeight
                cx = canvas.width / 2
                cy = canvas.height / 2
                init()
            }
        }

        class Particle {
            x: number
            y: number
            baseX: number
            baseY: number
            angle: number
            distance: number
            size: number
            density: number

            constructor(x: number, y: number) {
                this.x = x
                this.y = y
                this.baseX = x
                this.baseY = y

                // Calculamos distancia y ángulo hacia el centro del canvas para la rotación (Agujero Negro)
                let dx = x - cx
                let dy = y - cy
                this.distance = Math.sqrt(dx * dx + dy * dy)
                this.angle = Math.atan2(dy, dx)

                this.size = 1.3 // Puntos un poco más grandes
                this.density = (Math.random() * 30) + 2 // Más peso
            }

            draw() {
                // Aumentamos muchísimo la opacidad para que resalte en el fondo negro
                ctx!.fillStyle = 'rgba(255, 255, 255, 0.7)'
                ctx!.beginPath()
                ctx!.arc(this.x, this.y, this.size, 0, Math.PI * 2)
                ctx!.closePath()
                ctx!.fill()
            }

            update() {
                // ROTACIÓN ORBITAL TIPO AGUJERO NEGRO (VORTEX)
                // Rotación mucho más sutil y lenta. Los de adentro giran ligeramente más rápido.
                let speed = 0.0001 + (200 / (this.distance + 1)) * 0.0002
                this.angle += speed

                // Eliminamos la succión de gravedad hacia el centro para que los puntos NUNCA desaparezcan
                // y simplemente se queden orbitando fluidamente creando el remolino estético de forma infinita.

                // Posición actual en la órbita del vortex
                this.baseX = cx + Math.cos(this.angle) * this.distance
                this.baseY = cy + Math.sin(this.angle) * this.distance

                // Cálculo de repulsión del mouse (el "viento" del cursor)
                let dx = mouse.x - this.x
                let dy = mouse.y - this.y
                let distance = Math.sqrt(dx * dx + dy * dy)

                if (distance < mouse.radius) {
                    let forceDirectionX = dx / distance
                    let forceDirectionY = dy / distance
                    let maxDistance = mouse.radius
                    // Fuerza máxima en el centro, mínima en el borde del radio
                    let force = (maxDistance - distance) / maxDistance

                    let directionX = forceDirectionX * force * this.density
                    let directionY = forceDirectionY * force * this.density

                    // Empujar las partículas fuertemente
                    this.x -= directionX
                    this.y -= directionY
                } else {
                    // Volver a la posición elástica de la órbita (agujero negro)
                    if (this.x !== this.baseX) {
                        let dxPos = this.x - this.baseX
                        this.x -= dxPos / 10
                    }
                    if (this.y !== this.baseY) {
                        let dyPos = this.y - this.baseY
                        this.y -= dyPos / 10
                    }
                }
                this.draw()
            }
        }

        function init() {
            if (!canvas) return;
            particlesArray = []
            // Grilla espaciada inteligentemente. Menos puntos = mucho menos lag (CPU) y se ve estético igual.
            const spacing = window.innerWidth < 768 ? 20 : 16
            for (let y = 0; y < canvas.height; y += spacing) {
                for (let x = 0; x < canvas.width; x += spacing) {
                    let offsetX = (y / spacing) % 2 === 0 ? 0 : spacing / 2
                    particlesArray.push(new Particle(x + offsetX, y))
                }
            }
        }

        function animate() {
            if (!ctx || !canvas) return
            if (isVisible) {
                ctx.clearRect(0, 0, canvas.width, canvas.height)
                for (let i = 0; i < particlesArray.length; i++) {
                    particlesArray[i].update()
                }
            }
            animationFrameId = requestAnimationFrame(animate)
        }

        window.addEventListener('resize', resize)

        // Inicializar tamaño y array de partículas.
        resize()
        // Iniciar el bucle de animación! (esto faltaba)
        animate()

        // Por si Next.js tarda unos milisegundos en renderizar el tamaño real
        const timer = setTimeout(resize, 200)

        return () => {
            window.removeEventListener('resize', resize)
            container.removeEventListener('mousemove', handleMouseMove as any)
            container.removeEventListener('mouseleave', handleMouseLeave as any)
            cancelAnimationFrame(animationFrameId)
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [])

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen"
            style={{
                // Máscara radial estrictamente circular ('circle') para evitar que se vea ovalado
                // además se extiende la transparencia para que no tape tanto la foto, y 100% de fuerza en el centro del fondo.
                WebkitMaskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 15%, rgba(0,0,0,1) 80%)',
                maskImage: 'radial-gradient(circle at center, rgba(0,0,0,0) 15%, rgba(0,0,0,1) 80%)'
            }}
        />
    )
}
