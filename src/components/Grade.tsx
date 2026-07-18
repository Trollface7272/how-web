const GRADE_RANKS = ["XH", "X", "SH", "S", "A", "B", "C", "D", "F"] as const

type GradeRank = (typeof GRADE_RANKS)[number]

function normalizeRank(rank: string): GradeRank | null {
    const upper = rank.toUpperCase()
    if ((GRADE_RANKS as readonly string[]).includes(upper)) {
        return upper as GradeRank
    }

    // Legacy / alternate labels
    switch (upper) {
        case "SS":
            return "X"
        case "SSH":
            return "XH"
        default:
            return null
    }
}

export const Grade = ({
    rank,
    size = "medium",
    title,
}: {
    rank?: string | null
    size?: number | "tiny" | "small" | "medium"
    title?: string
}) => {
    if (!rank) return <span>-</span>

    const normalized = normalizeRank(rank)
    if (!normalized) return <span>{rank}</span>

    const sizeClass =
        typeof size === "number" ? undefined : `score-rank--${size}`

    return (
        <span
            className={`score-rank score-rank--${normalized}${sizeClass ? ` ${sizeClass}` : ""}`}
            style={
                typeof size === "number" ? { fontSize: `${size}px` } : undefined
            }
            title={title ?? rank}
            role="img"
            aria-label={rank}
        />
    )
}
