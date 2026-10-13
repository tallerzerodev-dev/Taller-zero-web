'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Mientras el pago se confirma, vuelve a pedir la página cada pocos segundos (hasta ~2 minutos).
export function AutoRefresh({ everyMs = 4000, maxTimes = 30 }: { everyMs?: number; maxTimes?: number }) {
    const router = useRouter()

    useEffect(() => {
        let count = 0
        const interval = setInterval(() => {
            count++
            router.refresh()
            if (count >= maxTimes) clearInterval(interval)
        }, everyMs)
        return () => clearInterval(interval)
    }, [router, everyMs, maxTimes])

    return null
}
