'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export function FadeIn({
    children,
    delay = 0,
    className = "",
    y = 20
}: {
    children: ReactNode,
    delay?: number,
    className?: string,
    y?: number
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
            className={className}
        >
            {children}
        </motion.div>
    )
}

export function StaggerContainer({ children, className = "" }: { children: ReactNode, className?: string }) {
    return (
        <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            transition={{ staggerChildren: 0.1 }}
            className={className}
        >
            {children}
        </motion.div>
    )
}
