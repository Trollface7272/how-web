"use client"
import { DatePicker, Select, Switch, theme } from "antd";
import { Line, LineChart, YAxis, Tooltip, XAxis, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { trpc } from "../../utils/trpc";
import moment from "moment";
import type { DailyChallengeData } from "../../types/daily-challenge";
import { createContext, useContext, useMemo, useState } from "react";
import dayjs from "dayjs";
import { modAcronyms } from "../../utils/osu/osu";
import { Container } from "../../components/GraphContainer";
import { Row } from "../../components/Row";
import { Loading } from "../../components/Loading";
import { Mods } from "../../utils/osu/mods";
import { TooltipIndex } from "recharts/types/state/tooltipSlice";
import { useRouter } from "next/router";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff6b6b", "#90e0ef", "#00b4d8", "#007bff", "#0056b3", "#003d80", "#002650"]

type Filters = {
    startDate?: dayjs.Dayjs | null
    endDate?: dayjs.Dayjs | null
    weekday?: string | null
}

type ModsData = {
    forced: {
        single: {
            [key: string]: { name: string, value: number, acronym: string }
        }
        combinations: {
            [key: string]: { name: string, value: number }
        }
    }
    used: {
        single: {
            [key: string]: { name: string, value: number, acronym: string }
        }
        combinations: {
            [key: string]: { name: string, value: number }
        }
    }
}

const Filters = ({ filters, setFilters }: { filters: Filters, setFilters: (filters: Filters) => void }) => {
    const { token } = theme.useToken()
    const { settings, setSettings } = useContext(SettingsContext)

    return (
        <div style={{ padding: "16px", backgroundColor: token.colorBgElevated, marginTop: 12 }}>
            <h2>Filters</h2>
            <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                <DatePicker.RangePicker value={[filters?.startDate, filters?.endDate]} onChange={(value) => setFilters({ startDate: value?.[0], endDate: value?.[1] })} />
                <Select
                    placeholder="Select weekday"
                    options={["All", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(item => ({ label: item, value: item }))}
                    value={filters?.weekday}
                    onChange={(value) => setFilters({ ...filters, weekday: value })}
                    style={{ width: 140, textAlign: "center" }}
                />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <Switch checked={settings.normalize} onChange={(value) => setSettings({ ...settings, normalize: value })} />
                <span>Normalize Score</span>
            </div>
        </div>
    )
}

const ParticipationChart = ({ data }: { data: DailyChallengeData[] }) => {
    const router = useRouter()

    const participationData = data.map(item => ({
        name: moment(item.starts_at).format("DD MMM YYYY"),
        date: item.starts_at,
        total: item.total,
    }))

    const onDoubleClick = (open?: number | TooltipIndex) => {
        const date = moment(participationData[open as number].date)
        router.push(`/daily-challenge/detail/${date.format("YYYY-MM-DD")}`)
    }


    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={participationData} onDoubleClick={(e) => onDoubleClick(e.activeIndex)}>
                <Line type={"basis"} dataKey="total" dot={false} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "black" }} />
                <XAxis dataKey="name" minTickGap={20} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const PlacementChart = ({ data }: { data: DailyChallengeData[] }) => {
    const [hidden, setHidden] = useState<string[]>(["top1", "top25", "top75"])
    const { settings } = useContext(SettingsContext)
    const router = useRouter()

    const handleLegendClick = (dataKey: string) => {
        if (hidden.includes(dataKey)) {
            setHidden(prev => prev.filter(key => key !== dataKey))
        } else {
            setHidden(prev => [...prev, dataKey])
        }
    }
    const placementData = data.map(item => {
        const multiplier = settings.normalize ? new Mods.ModList(item.current_playlist_item.required_mods as Mods.BaseMod[]).GetMultiplier() : 1

        return {
            name: moment(item.starts_at).format("DD MMM YYYY"),
            date: item.starts_at,
            rank1: Math.floor(item.thresholds?.rank1?.score / multiplier) || 0,
            top1: Math.floor(item.thresholds?.top1?.score / multiplier) || 0,
            top10: Math.floor(item.thresholds?.top10?.score / multiplier) || 0,
            top25: Math.floor(item.thresholds?.top25?.score / multiplier) || 0,
            top50: Math.floor(item.thresholds?.top50?.score / multiplier) || 0,
            top75: Math.floor(item.thresholds?.top75?.score / multiplier) || 0,
        }
    })

    const onDoubleClick = (open?: number | TooltipIndex) => {
        const date = moment(placementData[open as number].date)
        router.push(`/daily-challenge/detail/${date.format("YYYY-MM-DD")}`)
    }

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={placementData} onDoubleClick={(e) => onDoubleClick(e.activeIndex)}>
                <Line type={"linear"} hide={hidden.includes("rank1")} dataKey="rank1" dot={false} name={"Rank 1"} stroke="var(--gold)" strokeWidth={1.2} />
                <Line type={"linear"} hide={hidden.includes("top1")} dataKey="top1" dot={false} name={"Top 1%"} stroke="var(--purple)" strokeWidth={1.2} />
                <Line type={"linear"} hide={hidden.includes("top10")} dataKey="top10" dot={false} name={"Top 10%"} stroke="var(--silver)" strokeWidth={1.2} />
                <Line type={"linear"} hide={hidden.includes("top25")} dataKey="top25" dot={false} name={"Top 25%"} stroke="var(--blue)" strokeWidth={1.2} />
                <Line type={"linear"} hide={hidden.includes("top50")} dataKey="top50" dot={false} name={"Top 50%"} stroke="var(--bronze)" strokeWidth={1.2} />
                <Line type={"linear"} hide={hidden.includes("top75")} dataKey="top75" dot={false} name={"Top 75%"} stroke="var(--iron)" strokeWidth={1.2} />
                <YAxis domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ backgroundColor: "black" }} formatter={(num) => num.toLocaleString()} />
                <XAxis dataKey="name" minTickGap={20} />
                <Legend formatter={(value, entry) => (<span style={{ color: entry.inactive ? "gray" : entry?.color }}>{value}</span>)} onClick={props => handleLegendClick(props.dataKey as string)} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const ModsChart = ({ data }: { data: DailyChallengeData[] }) => {
    const modsData: ModsData = {
        forced: {
            single: {}, combinations: {}
        },
        used: {
            single: {}, combinations: {}
        }
    }
    data.forEach(item => {
        const forcedMods = item.current_playlist_item.required_mods
        if (forcedMods.length === 0) return
        let combo = ""
        forcedMods.forEach(mod => {
            if (!modAcronyms[mod.acronym as keyof typeof modAcronyms]) console.log(mod.acronym)
            if (modsData.forced.single[mod.acronym]) modsData.forced.single[mod.acronym].value++
            else modsData.forced.single[mod.acronym] = { name: modAcronyms[mod.acronym as keyof typeof modAcronyms], value: 1, acronym: mod.acronym }
            combo += mod.acronym
        })
        if (modsData.forced.combinations[combo]) modsData.forced.combinations[combo].value++
        else modsData.forced.combinations[combo] = { name: combo, value: 1 }
        const usedMods = item.modData
        Object.keys(usedMods?.single ?? []).forEach(mod => {
            if (modsData.used.single[mod]) modsData.used.single[mod].value += usedMods.single[mod].total
            else modsData.used.single[mod] = { name: modAcronyms[mod as keyof typeof modAcronyms], value: 1, acronym: mod }
        })
        Object.keys(usedMods?.combinations ?? []).forEach(combo => {
            if (modsData.used.combinations[combo]) modsData.used.combinations[combo].value += usedMods.combinations[combo].total
            else modsData.used.combinations[combo] = { name: combo, value: 1 }
        })
    })

    const allSingleData = Object.values(modsData.forced.single).sort((a, b) => b.value - a.value)
    const singleData = [...allSingleData.slice(0, 11), allSingleData.slice(11).reduce((acc, curr) => { acc.value += curr.value; return acc }, { name: "Other", value: 0 })]
    const allCombinationsData = Object.values(modsData.forced.combinations).sort((a, b) => b.value - a.value)
    const combinationsData = [...allCombinationsData.slice(0, 11), allCombinationsData.slice(11).reduce((acc, curr) => { acc.value += curr.value; return acc }, { name: "Other", value: 0 })]

    const allUsedSingleData = Object.values(modsData.used.single).sort((a, b) => b.value - a.value)
    const usedSingleData = [...allUsedSingleData.slice(0, 15), allUsedSingleData.slice(15).reduce((acc, curr) => { acc.value += curr.value; return acc }, { name: "Other", value: 0 })]
    const allUsedCombinationsData = Object.values(modsData.used.combinations).sort((a, b) => b.value - a.value)
    const usedCombinationsData = [...allUsedCombinationsData.slice(0, 15), allUsedCombinationsData.slice(15).reduce((acc, curr) => { acc.value += curr.value; return acc }, { name: "Other", value: 0 })]


    return (
        <>
            <Row>
                <div style={{ width: "25%", fontSize: 18, fontWeight: "bold" }}>
                    Forced Mods
                </div>
                <div style={{ width: "25%", fontSize: 18, fontWeight: "bold" }}>
                    Forced Mod Combinations
                </div>
                <div style={{ width: "25%", fontSize: 18, fontWeight: "bold" }}>
                    Used Mods
                </div>
                <div style={{ width: "25%", fontSize: 18, fontWeight: "bold" }}>
                    Used Mod Combinations
                </div>
            </Row>
            <div style={{ display: "flex", gap: 16 }}>
                <ResponsiveContainer width={"25%"} height={400}>
                    <PieChart>
                        <Pie data={singleData} dataKey="value" nameKey="name" outerRadius={180} stroke="none">
                            {singleData.map((el, i) =>
                                <Cell key={el.name} fill={COLORS[i]} name={el.name} />)
                            }
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer >
                <ResponsiveContainer width={"25%"} height={400}>
                    <PieChart>
                        <Pie data={combinationsData} dataKey="value" nameKey="name" outerRadius={180} stroke="none">
                            {combinationsData.map((el, i) =>
                                <Cell key={el.name} fill={COLORS[i]} name={el.name} />)
                            }
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width={"25%"} height={400}>
                    <PieChart>
                        <Pie data={usedSingleData} dataKey="value" nameKey="name" outerRadius={180} stroke="none">
                            {usedSingleData.map((el, i) =>
                                <Cell key={el.name} fill={COLORS[i]} name={el.name} />)
                            }
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <ResponsiveContainer width={"25%"} height={400}>
                    <PieChart>
                        <Pie data={usedCombinationsData} dataKey="value" nameKey="name" outerRadius={180} stroke="none">
                            {usedCombinationsData.map((el, i) =>
                                <Cell key={el.name} fill={COLORS[i]} name={el.name} />)
                            }
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </>
    )
}

const PlayerRetention = ({ data }: { data: Record<number, number> }) => {
    const participationData = useMemo(() => {
        const ret: Record<number, { count: number, participated: number, name: string }> = {}
        const to = Object.keys(data).reduce((acc, curr) => Math.max(acc, Number(curr)), 0)
        const from = 1

        for (let i = from; i <= to; i++) {
            if (data[i]) ret[i] = { count: data[i], participated: i, name: `Participated ${i} times` }
            else ret[i] = { count: 0, participated: i, name: `Participated ${i} times` }
        }
        return ret
    }, [data])

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={Object.values(participationData)}>
                <Line type={"linear"} dataKey="count" dot={false} name={"Participation"} strokeWidth={1.2} />
                <YAxis scale={"symlog"} diffuseConstant={1} ticks={[1, 10, 100, 1000, 10000, 100000]} />
                <XAxis interval={9} />
                <Tooltip labelFormatter={(label) => participationData[label + 1]?.name ?? "unknown"} contentStyle={{ backgroundColor: "black" }} />
            </LineChart>
        </ResponsiveContainer>
    )
}
type settings = {
    normalize: boolean
}
const SettingsContext = createContext<{ settings: settings, setSettings: (settings: settings) => void }>({ settings: { normalize: false }, setSettings: () => { } })

const DailyChallengeStats = () => {
    const { isLoading, isError, data } = trpc.dailyChallenge.getChartData.useQuery()
    const [filters, setFilters] = useState<Filters>({})
    const [settings, setSettings] = useState<settings>({ normalize: false })

    const filtered = useMemo(() => {
        const dailyChallenge = data?.dailyChallenge?.filter(item => {
            let ret = true
            const { startDate, endDate, weekday } = filters
            if (startDate && endDate)
                ret = moment(item.starts_at).isBetween(startDate.toDate(), endDate.toDate(), null, "[]")
            if (weekday && weekday !== "All")
                ret = ret && moment(item.starts_at).format("dddd") === weekday
            return ret
        })

        const retentionData = data?.retentionData?.total

        return {
            dailyChallenge, retentionData
        }
    }, [data, filters])

    const filteredData = filtered?.dailyChallenge
    const retentionData = filtered?.retentionData

    if (isLoading) return <Loading fullPage />
    if (isError) return <div>Error loading data</div>
    if (!data || !filteredData || !retentionData) return <div>No data available</div>

    return (
        <>
            <SettingsContext.Provider value={{ settings, setSettings }}>
                <Filters filters={filters} setFilters={setFilters} />
                <Container title="Participation">
                    <ParticipationChart data={filteredData} />
                </Container>

                <Container title="Placement">
                    <PlacementChart data={filteredData} />
                </Container>

                <Container title="Mods">
                    <ModsChart data={filteredData} />
                </Container>

                <Container title="Player Retention">
                    <PlayerRetention data={retentionData} />
                </Container>
            </SettingsContext.Provider>
        </>
    )
}

export default DailyChallengeStats