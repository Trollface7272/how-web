"use client"
import Moment from "moment"
import Image from "next/image"
import { useRouter } from "next/router"
import { Container } from "../../../components/GraphContainer"
import { ICellData, IMatrixData, Matrix } from "../../../components/Matrix"
import { trpc } from "../../../utils/trpc"
import { GetUserResponse } from "../../../types/daily-challenge"
import {
    Line,
    LineChart,
    ResponsiveContainer,
    YAxis,
    XAxis,
    Tooltip,
} from "recharts"
import { useMemo, useState } from "react"
import { Loading } from "../../../components/Loading"
import { Select } from "antd"
import { extendMoment } from "moment-range"
import { firstDailyChallengeDate } from "../../../utils/osu/osu"
import { TooltipIndex } from "recharts/types/state/tooltipSlice"

//@ts-ignore
const moment = extendMoment(Moment)

const legendData = [
    { color: "var(--lustrous-gradient)", label: "Rank 1" },
    { color: "var(--radiant-gradient)", label: "Top 1%" },
    { color: "var(--gold)", label: "Top 10%" },
    { color: "var(--silver)", label: "Top 50%" },
    { color: "var(--bronze", label: "Top 75%" },
    { color: "var(--iron)", label: "Participated" },
    { color: "#505050", label: "Not participated" },
]

const placementToColor = (placement: number, placementPercent: number) => {
    if (placement === 1) return legendData[0].color
    if (placementPercent <= 1) return legendData[1].color
    if (placementPercent <= 10) return legendData[2].color
    if (placementPercent <= 50) return legendData[3].color
    if (placementPercent <= 75) return legendData[4].color
    return legendData[5].color
}

const CellTooltip = ({
    placement,
    placementPercent,
    score,
    date,
}: {
    placement: number
    placementPercent: number
    score: number
    date: string
}) => {
    return (
        <div style={{ fontSize: 16 }}>
            <div className="text-center">{date}</div>
            <div>
                Placement: #{placement} ({placementPercent.toFixed(2)}%)
            </div>
            <div>Score: {score.toLocaleString()}</div>
        </div>
    )
}

const Participation = ({
    scores,
}: {
    scores: GetUserResponse["scoreData"]
}) => {
    const router = useRouter()
    const [filter, setFilter] = useState<null | number>(2025)
    const cellData: Record<string, ICellData> = {}

    const minDate = firstDailyChallengeDate()
    const maxDate = moment().startOf("day")

    const [from, to] = useMemo(() => {
        if (filter) {
            return [
                moment().year(filter).startOf("year").startOf("week"),
                moment().year(filter).endOf("year").endOf("week"),
            ]
        }
        return [undefined, undefined]
    }, [filter])

    scores.forEach(score => {
        if (
            from &&
            from >= moment(score.date) &&
            to &&
            to <= moment(score.date)
        )
            return
        cellData[moment(score.date).format("YYYY-MM-DD")] = {
            date: new Date(score.date),
            color: placementToColor(score.position, score.positionPercent),
            Tooltip: (
                <CellTooltip
                    placement={score.position}
                    placementPercent={score.positionPercent}
                    score={score.score}
                    date={moment(score.date).format("DD MMM YYYY")}
                />
            ),
        }
    })
    const matrixData: IMatrixData = {
        CellData: cellData,
    }

    const years = useMemo(() => {
        const ret = []
        for (let i = 2024; i <= moment().year(); i++) {
            ret.push(i)
        }
        return ret
    }, [])

    const onDoubleClick = (data: ICellData) => {
        const date = moment(data.date)
        if (date.isBefore(firstDailyChallengeDate())) return
        if (date.isAfter(moment())) return
        router.push(`/daily-challenge/detail/${date.format("YYYY-MM-DD")}`)
    }

    return (
        <>
            <div
                style={{
                    marginBottom: 10,
                    display: "flex",
                    justifyContent: "center",
                }}
            >
                <Select
                    style={{ width: 100 }}
                    value={filter}
                    onChange={value => setFilter(value as number)}
                >
                    <Select.Option value={null}>Last year</Select.Option>
                    {years.map(el => (
                        <Select.Option key={el} value={el}>
                            {el}
                        </Select.Option>
                    ))}
                </Select>
            </div>
            <Matrix
                onDoubleClick={onDoubleClick}
                data={matrixData}
                legendData={legendData}
                defaultColor={legendData.at(-1)!.color}
                from={from}
                to={to}
                minDate={minDate}
                maxDate={maxDate}
            />
        </>
    )
}

const Score = ({ scores }: { scores: GetUserResponse["scoreData"] }) => {
    const router = useRouter()
    const data = useMemo(() => {
        return scores.map(score => {
            return {
                score: score.score,
                date: moment(score.date).format("DD MMM YYYY"),
            }
        })
    }, [scores])

    const onDoubleClick = (open?: number | TooltipIndex) => {
        const date = moment(data[open as number].date)
        router.push(`/daily-challenge/detail/${date.format("YYYY-MM-DD")}`)
    }

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart
                data={data}
                onDoubleClick={e => onDoubleClick(e.activeIndex)}
            >
                <Line
                    type="linear"
                    yAxisId={"left"}
                    dot={false}
                    name="Score"
                    dataKey="score"
                    stroke="#8884d8"
                />
                <XAxis dataKey="date" />
                <YAxis dataKey="score" />
                <Tooltip
                    contentStyle={{ backgroundColor: "black" }}
                    formatter={num => num.toLocaleString()}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

const Placement = ({ scores }: { scores: GetUserResponse["scoreData"] }) => {
    const router = useRouter()
    const data = useMemo(() => {
        return scores.map(score => {
            return {
                placement: score.position,
                placementText: `#${score.position} (${score.positionPercent.toFixed(2)}%)`,
                date: moment(score.date).format("DD MMM YYYY"),
            }
        })
    }, [scores])

    const onDoubleClick = (open?: number | TooltipIndex) => {
        const date = moment(data[open as number].date)
        router.push(`/daily-challenge/detail/${date.format("YYYY-MM-DD")}`)
    }

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart
                data={data}
                onDoubleClick={e => onDoubleClick(e.activeIndex)}
            >
                <Line
                    type="linear"
                    dot={false}
                    name="Placement"
                    dataKey="placement"
                    stroke="#82ca9d"
                />
                <XAxis dataKey="date" />
                <YAxis dataKey="placement" />
                <Tooltip
                    contentStyle={{ backgroundColor: "black" }}
                    formatter={(num, name, item) => item.payload.placementText}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}

const User = () => {
    const { id } = useRouter().query
    const { data, isLoading, isError } = trpc.dailyChallenge.getUser.useQuery(
        { id: id as string },
        {
            enabled: !!id,
        },
    )

    const avgScore = useMemo(() => {
        if (!data) return 0
        return Math.round(
            data.scoreData.reduce((acc, score) => acc + score.score, 0) /
                data.scoreData.length,
        )
    }, [data])

    if (isLoading) return <Loading fullPage />
    if (isError) return <div>Error loading user</div>
    if (!data) return <div>User not found</div>

    return (
        <>
            <Container title="">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        justifyContent: "center",
                    }}
                >
                    <div>
                        <Image
                            alt="avatar"
                            src={`https://a.ppy.sh/${data.id}`}
                            width={75}
                            height={75}
                            style={{ borderRadius: "50%" }}
                        />
                    </div>
                    <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                        {data.username}
                    </div>
                </div>
            </Container>
            <Container title="Participation">
                <Participation scores={data.scoreData} />
            </Container>
            <Container title="Placement">
                <div>
                    Average Placement: {data.averagePlacement.toFixed(0)} (
                    {data.averagePlacementPercent.toFixed(2)}%)
                </div>
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
