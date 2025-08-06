"use client"
import { DatePicker, theme } from "antd"
import dayjs from "dayjs"
import moment from "moment"
import Image from "next/image"
import { useRouter } from "next/router"
import { useState } from "react"
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { Box } from "../../../components/Box"
import { Container } from "../../../components/GraphContainer"
import { Mod } from "../../../components/Mod"
import { Row } from "../../../components/Row"
import { Beatmap, Thresholds } from "../../../types/daily-challenge"
import { Mod as IMod } from "../../../types/daily-challenge-profile"
import { formatTime } from "../../../utils/helpers"
import { trpc } from "../../../utils/trpc"

const DailyChallengePicker = () => {
    const router = useRouter()
    let { date } = router.query
    if (date === "current") date = dayjs().format("YYYY-MM-DD")

    return (
        <DatePicker style={{ padding: 8 }} defaultValue={dayjs(date as string, "YYYY-MM-DD")} format="YYYY-MM-DD" onChange={(d) => {
            if (d) {
                router.push(`/daily-challenge/detail/${d.format("YYYY-MM-DD")}`)
            }
        }} />
    )
}

const BeatmapInfo = ({ beatmap, required_mods, thresholds }: { beatmap: Beatmap, required_mods: IMod[], thresholds: Thresholds[] }) => {
    const threshold = thresholds.at(-1)!
    return (
        <>
            <div style={{ width: "50%", textAlign: "center" }}>
                <div style={{ fontSize: 24, fontWeight: "bold", display: "flex", flexDirection: "row", gap: 4, justifyContent: "center" }}>
                    <span>{beatmap.beatmapset.artist}</span>
                    <span> - </span>
                    <span>{beatmap.beatmapset.title}</span>
                    <span> [{beatmap.version}]</span>
                    <span style={{ fontSize: 32, marginLeft: 8, display: "flex" }}>
                        {required_mods.map((mod) => <Mod key={mod.acronym} mod={mod} />)}
                    </span>
                </div>
                <Box>
                    <Row>
                        <div>Approach Rate: <span>{beatmap.ar}</span></div>
                        <div>Overall Difficulty: <span>{beatmap.accuracy}</span></div>
                        <div>Health Drain: <span>{beatmap.drain}</span></div>
                        <div>Circle Size: <span>{beatmap.cs}</span></div>
                    </Row>
                    <Row>
                        <div style={{ width: "33%" }}>Star Rating: <span>{beatmap.difficulty_rating}</span></div>
                        <div style={{ width: "33%" }}>Length: <span>{formatTime(beatmap.total_length)}</span></div>
                        <div style={{ width: "33%" }}>BPM: <span>{beatmap.bpm}</span></div>
                    </Row>
                    <Row>
                        <div style={{ width: "33%" }}>Top 1: <span>{threshold.rank1.score.toLocaleString()}</span></div>
                        <div style={{ width: "33%" }}>Top 10%: <span>{threshold.top10.score.toLocaleString()}</span><span> (#{threshold.top10.position})</span></div>
                        <div style={{ width: "33%" }}>Top 50%: <span>{threshold.top50.score.toLocaleString()}</span><span> (#{threshold.top50.position})</span></div>
                    </Row>
                    <Row style={{ marginTop: 16 }}>
                        <DailyChallengePicker />
                    </Row>
                </Box>

            </div>
            <div style={{ width: "50%", textAlign: "center" }}>
                <Image width={0} height={0}
                    sizes="100vw"
                    src={beatmap.beatmapset.covers["cover@2x"]}
                    alt={beatmap.beatmapset.title}
                    style={{
                        width: '100%',
                        height: 'auto',
                    }}
                />
            </div>
        </>
    )
}

const ParticipationGraph = ({ thresholds }: { thresholds: Thresholds[] }) => {
    const data = thresholds.map(threshold => ({
        date: moment(threshold.date).format("HH:mm"),
        total: threshold.total,
        top10: threshold.top10.position,
        top50: threshold.top50.position,
    }))

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <Line type={"linear"} dataKey="total" dot={false} name={"Total"} stroke="yellow" strokeWidth={1.5} />
                <Line type={"linear"} dataKey="top10" dot={false} name={"Top 10%"} stroke="silver" strokeWidth={1.5} />
                <Line type={"linear"} dataKey="top50" dot={false} name={"Top 50%"} stroke="#CD7F32" strokeWidth={1.5} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "black" }} formatter={(num) => num.toLocaleString()} />
                <Legend />
            </LineChart>
        </ResponsiveContainer>
    )
}

const ThresholdsGraph = ({ thresholds }: { thresholds: Thresholds[] }) => {
    const [hidden, setHidden] = useState<string[]>([])
    const data = thresholds.map(threshold => ({
        date: moment(threshold.date).format("HH:mm"),
        top1: threshold.rank1.score,
        top10: threshold.top10.score,
        top50: threshold.top50.score,
    }))

    const handleLegendClick = (dataKey: string) => {
        if (hidden.includes(dataKey)) {
            setHidden(prev => prev.filter(key => key !== dataKey))
        } else {
            setHidden(prev => [...prev, dataKey])
        }
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
                <Line type={"linear"} hide={hidden.includes("top1")} dataKey="top1" dot={false} name={"Rank 1"} stroke="yellow" strokeWidth={1.5} />
                <Line type={"linear"} hide={hidden.includes("top10")} dataKey="top10" dot={false} name={"Top 10%"} stroke="silver" strokeWidth={1.5} />
                <Line type={"linear"} hide={hidden.includes("top50")} dataKey="top50" dot={false} name={"Top 50%"} stroke="#CD7F32" strokeWidth={1.5} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "black" }} formatter={(num) => num.toLocaleString()} />
                <Legend onClick={props => handleLegendClick(props.dataKey as string)} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const DailyChallengeCurrent = () => {
    const router = useRouter()
    const { date } = router.query
    const { data, isLoading, isError } = trpc.dailyChallenge.getDailyChallenge.useQuery({ date: date === "current" ? undefined : date as string })
    const { token } = theme.useToken()

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error</div>
    if (!data) return <div>No data</div>

    const { currentChallenge: { beatmap, required_mods }, thresholds } = data


    return (
        <div>
            <Container title="Current Challenge">
                <div style={{ display: "flex", gap: 16, flexDirection: "row" }}>
                    <BeatmapInfo beatmap={beatmap} required_mods={required_mods} thresholds={thresholds} />
                </div>
            </Container>

            <Container title="Thresholds">
                <ThresholdsGraph thresholds={thresholds} />
            </Container>

            <Container title="Participation">
                <ParticipationGraph thresholds={thresholds} />
            </Container>
        </div>
    )
}

export const dynamic = "force-dynamic"

export default DailyChallengeCurrent