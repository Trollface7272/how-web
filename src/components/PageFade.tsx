"use client"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export const PageFade = ({ children }: { children: React.ReactNode }) => {
    const router = useRouter()
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setVisible(false)
        const id = requestAnimationFrame(() => setVisible(true))
        return () => cancelAnimationFrame(id)
    }, [router.asPath])

    return (
        <div className={`page-fade${visible ? " page-fade--visible" : ""}`}>
            {children}
        </div>
    )
}
