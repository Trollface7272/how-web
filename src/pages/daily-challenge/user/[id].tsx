"use client"
import moment from "moment"
import Image from "next/image"
import { useRouter } from "next/router"
import { Container } from "../../../components/GraphContainer"
import { ICellData, IMatrixData, Matrix } from "../../../components/Matrix"
import { trpc } from "../../../utils/trpc"
import { GetUserResponse } from "../../../types/daily-challenge"
import { Line, LineChart, ResponsiveContainer, YAxis, XAxis, Tooltip } from "recharts"
import { useMemo } from "react"

const legendData = [
    { color: "gold", label: "Rank 1" },
    { color: "#b0b0b0", label: "Top 10%" },
    { color: "#CD7F32", label: "Top 50%" },
    { color: "green", label: "Participated" },
    { color: "gray", label: "Not participated" }
]

const placementToColor = (placement: number, placementPercent: number) => {
    if (placement === 1) return "gold"
    if (placementPercent <= 10) return "#b0b0b0"
    if (placementPercent <= 50) return "#CD7F32"
    return "green"
}

const CellTooltip = ({ placement, placementPercent, score, date }: { placement: number, placementPercent: number, score: number, date: string }) => {
    return (
        <div style={{ fontSize: 16 }}>
            <div className="text-center">{date}</div>
            <div>Placement: #{placement} ({placementPercent.toFixed(2)}%)</div>
            <div>Score: {score.toLocaleString()}</div>
        </div>
    )
}

const Participation = ({ scores }: { scores: GetUserResponse["scoreData"] }) => {
    const cellData: Record<string, ICellData> = {}
    scores.forEach((score) => {
        cellData[moment(score.date).format("YYYY-MM-DD")] = {
            date: new Date(score.date),
            color: placementToColor(score.position, score.positionPercent),
            Tooltip: <CellTooltip placement={score.position} placementPercent={score.positionPercent} score={score.score} date={moment(score.date).format("DD MMM YYYY")} />
        }
    })
    const matrixData: IMatrixData = {
        CellData: cellData
    }
    return (
        <Matrix data={matrixData} legendData={legendData} defaultColor="gray" />
    )
}

const Score = ({ scores }: { scores: GetUserResponse["scoreData"] }) => {
    const data = useMemo(() => {
        return scores.map(score => {
            return {
                score: score.score,
                placement: score.position,
                placementPercent: score.positionPercent,
                date: moment(score.date).format("DD MMM YYYY")
            }
        })
    }, [scores])
    console.log(data)

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={data}>
                <Line type="linear" yAxisId={"left"} dot={false} name="Score" dataKey="score" stroke="#8884d8" />
                <XAxis dataKey="date" />
                <YAxis dataKey="score" />
                <Tooltip contentStyle={{ backgroundColor: "black" }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const Placement = ({ scores }: { scores: GetUserResponse["scoreData"] }) => {

    const data = useMemo(() => {
        return scores.map(score => {
            return {
                placement: score.position,
                placementText: `#${score.position} (${score.positionPercent.toFixed(2)}%)`,
                date: moment(score.date).format("DD MMM YYYY")
            }
        })
    }, [scores])
    console.log(data)

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={data}>
                <Line type="linear" dot={false} name="Placement" dataKey="placement" stroke="#82ca9d" />
                <XAxis dataKey="date" />
                <YAxis dataKey="placement" />
                <Tooltip contentStyle={{ backgroundColor: "black" }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const User = () => {
    const { id } = useRouter().query
    const { data, isLoading, isError } = trpc.dailyChallenge.getUser.useQuery({ id: id as string }, {
        enabled: !!id
    })

    const avgScore = useMemo(() => {
        if (!data) return 0
        return Math.round(data.scoreData.reduce((acc, score) => acc + score.score, 0) / data.scoreData.length)
    }, [data])

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading user</div>
    if (!data) return <div>User not found</div>

    return (
        <>
            <Container title="">
                <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "center" }}>
                    <div>
                        <Image alt="avatar" src={`https://a.ppy.sh/${data.id}`} width={75} height={75} style={{ borderRadius: "50%" }} />
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold" }}>{data.username}</div>
                </div>
            </Container>
            <Container title="Participation">
                <Participation scores={data.scoreData} />
            </Container>
            <Container title="Placement">
                <div>Average Placement: {data.averagePlacement.toFixed(0)} ({data.averagePlacementPercent.toFixed(2)}%)</div>
                <Placement scores={data.scoreData} />
            </Container>
            <Container title="Score">
                <div>Average Score: {avgScore.toLocaleString()}</div>
                <Score scores={data.scoreData} />
            </Container>
        </>
    )
}

export default User