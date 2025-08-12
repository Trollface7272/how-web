import { useRouter } from "next/router"
import { useEffect } from "react"
import { Loading } from "../components/Loading"

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        router.push("/daily-challenge/stats")
    }, [router])

    return <Loading fullPage />
}
