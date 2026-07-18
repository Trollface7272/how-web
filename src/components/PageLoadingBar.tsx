"use client"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"

export const PageLoadingBar = () => {
    const router = useRouter()
    const [active, setActive] = useState(false)
    const [done, setDone] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        let hideTimer: ReturnType<typeof setTimeout> | undefined

        const start = () => {
            clearTimeout(hideTimer)
            setDone(false)
            setMounted(true)
            requestAnimationFrame(() => setActive(true))
        }

        const finish = () => {
            setActive(false)
            setDone(true)
            hideTimer = setTimeout(() => {
                setMounted(false)
                setDone(false)
            }, 280)
        }

        router.events.on("routeChangeStart", start)
        router.events.on("routeChangeComplete", finish)
        router.events.on("routeChangeError", finish)

        return () => {
            clearTimeout(hideTimer)
            router.events.off("routeChangeStart", start)
            router.events.off("routeChangeComplete", finish)
            router.events.off("routeChangeError", finish)
        }
    }, [router.events])

    if (!mounted) return null

    const className = [
        "page-loading-bar",
        active && "page-loading-bar--active",
        done && "page-loading-bar--done",
    ]
        .filter(Boolean)
        .join(" ")

    return <div className={className} aria-hidden />
}
