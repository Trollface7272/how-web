import { DatePicker, Select, theme } from "antd";
import { Line, LineChart, YAxis, Tooltip, XAxis, ResponsiveContainer, Legend, PieChart, Pie, Cell, getNiceTickValues } from "recharts";
import { trpc } from "../../utils/trpc";
import moment from "moment";
import type { DailyChallengeData, GetDailyChallengeResponse } from "../../types/daily-challenge";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { modAcronyms } from "../../utils/osu";
import { DailyChallengeUserData } from "../../types/daily-challenge-profile";
import { scaleSymlog } from "d3-scale";
import { Container } from "../../components/GraphContainer";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#a4de6c", "#d0ed57", "#ffc658", "#ff6b6b", "#90e0ef", "#00b4d8", "#007bff", "#0056b3", "#003d80", "#002650"]

type Filters = {
    startDate?: dayjs.Dayjs | null
    endDate?: dayjs.Dayjs | null
    weekday?: string | null
}

type ModsData = {
    forced: {
        single: {
            [key: string]: { name: string, value: number }
        }
        combinations: {
            [key: string]: { name: string, value: number }
        }
    }
    used: {
        single: {
            [key: string]: { name: string, value: number }
        }
        combinations: {
            [key: string]: { name: string, value: number }
        }
    }
}

const Filters = ({ filters, setFilters }: { filters: Filters, setFilters: (filters: Filters) => void }) => {
    const { token } = theme.useToken()

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
                    style={{ width: 115, textAlign: "center" }}
                />
            </div>
        </div>
    )
}

const ParticipationChart = ({ data }: { data: DailyChallengeData[] }) => {
    const { token } = theme.useToken()
    const participationData = data.map(item => ({
        name: moment(item.starts_at).format("DD MMM YYYY"),
        total: item.total,
    }))
    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={participationData}>
                <Line type={"basis"} dataKey="total" dot={false} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "black" }} />
                <XAxis dataKey="name" minTickGap={20} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const PlacementChart = ({ data }: { data: DailyChallengeData[] }) => {
    const placementData = data.map(item => ({
        name: moment(item.starts_at).format("DD MMM YYYY"),
        top1: item.thresholds?.rank1?.score || 0,
        top10: item.thresholds?.top10?.score || 0,
        top50: item.thresholds?.top50?.score || 0,
    }))

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={placementData}>
                <Line type={"basis"} dataKey="top1" dot={false} name={"Rank 1"} stroke="yellow" strokeWidth={1.2} />
                <Line type={"basis"} dataKey="top10" dot={false} name={"Top 10%"} stroke="silver" strokeWidth={1.2} />
                <Line type={"basis"} dataKey="top50" dot={false} name={"Top 50%"} stroke="#CD7F32" strokeWidth={1.2} />
                <YAxis />
                <Tooltip contentStyle={{ backgroundColor: "black" }} formatter={(num) => num.toLocaleString()} />
                <XAxis dataKey="name" minTickGap={20} />
                <Legend />
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
    const { token } = theme.useToken()
    data.forEach(item => {
        const forcedMods = item.current_playlist_item.required_mods
        if (forcedMods.length === 0) return
        let combo = ""
        forcedMods.forEach(mod => {
            if (!modAcronyms[mod.acronym as keyof typeof modAcronyms]) console.log(mod.acronym)
            if (modsData.forced.single[mod.acronym]) modsData.forced.single[mod.acronym].value++
            else modsData.forced.single[mod.acronym] = { name: modAcronyms[mod.acronym as keyof typeof modAcronyms], value: 1 }
            combo += mod.acronym
        })
        if (modsData.forced.combinations[combo]) modsData.forced.combinations[combo].value++
        else modsData.forced.combinations[combo] = { name: combo, value: 1 }
        const usedMods = item.modData
        Object.keys(usedMods?.single ?? []).forEach(mod => {
            if (modsData.used.single[mod]) modsData.used.single[mod].value += usedMods.single[mod].total
            else modsData.used.single[mod] = { name: modAcronyms[mod as keyof typeof modAcronyms], value: 1 }
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
    )
}

const PlayerRetention = ({ data }: { data: DailyChallengeUserData[] }) => {
    const participationData: Record<number, { count: number, participated: number, name: string }> = {}
    const sorted = data.sort((a, b) => b.played.count - a.played.count)

    const to = sorted[0].played.count
    const from = sorted[sorted.length - 1].played.count

    for (let i = from; i <= to; i++) {
        if (!participationData[i]) participationData[i] = { count: 0, participated: i, name: `Participated ${i} times` }
    }

    sorted.forEach(item => {
        participationData[item.played.count].count++
    })

    console.log(participationData)

    return (
        <ResponsiveContainer width={"100%"} height={400}>
            <LineChart data={Object.values(participationData)}>
                <Line type={"linear"} dataKey="count" dot={false} name={"Participation"} strokeWidth={1.2} />
                <YAxis scale={"symlog"} diffuseConstant={1} ticks={[1, 10, 100, 1000, 10000, 100000]} />
                <XAxis interval={9} />
                <Tooltip labelFormatter={(label) => participationData[label+1]?.name ?? "unknown"} contentStyle={{ backgroundColor: "black" }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

const DailyChallengeStats = () => {
    const { isLoading, isError, data } = trpc.dailyChallenge.getChartData.useQuery()
    const [filters, setFilters] = useState<Filters>({})

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

        const ids = dailyChallenge?.map(item => item.current_playlist_item.room_id) ?? []

        const dailyChallengeUser = data?.dailyChallengeUser?.map(user => {
            const player_rooms = user.played.rooms.filter(room => ids.includes(room))
            const top10_rooms = user.top10Percent.rooms.filter(room => ids.includes(room))
            const top50_rooms = user.top50Percent.rooms.filter(room => ids.includes(room))
            const user_filtered: DailyChallengeUserData = {
                country: user.country,
                played: {
                    rooms: player_rooms,
                    count: player_rooms.length
                },
                top10Percent: {
                    rooms: top10_rooms,
                    count: top10_rooms.length
                },
                top50Percent: {
                    rooms: top50_rooms,
                    count: top50_rooms.length
                }
            }
            return user_filtered
        })

        return {
            dailyChallenge, dailyChallengeUser
        }
    }, [data, filters])

    const filteredData = filtered?.dailyChallenge
    const filteredUserData = filtered?.dailyChallengeUser

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading data</div>
    if (!data || !filteredData || !filteredUserData) return <div>No data available</div>

    return (
        <>
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
                <PlayerRetention data={filteredUserData} />
            </Container>
        </>
    )
}


export default DailyChallengeStats