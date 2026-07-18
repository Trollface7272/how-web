"use client"
import { DatePicker, Select, Spin, Table, TablePaginationConfig } from "antd"
import dayjs from "dayjs"
import Image from "next/image"
import { useRouter } from "next/router"
import { useMemo, useState } from "react"
import Flag from "react-world-flags"
import { debounce, formatTime } from "../utils/helpers"
import { firstDailyChallengeDate } from "../utils/osu/osu"
import { trpc } from "../utils/trpc"
import { Grade } from "./Grade"
import { Loading } from "./Loading"
import { Mod } from "./Mod"
import { Row } from "./Row"

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

const SORT_OPTIONS = [
    { title: "Performance", value: "performance", label: "Performance" },
    { title: "Total Score", value: "total_score", label: "Total Score" },
    { title: "Accuracy", value: "accuracy", label: "Accuracy" },
    { title: "Rank", value: "rank", label: "Rank" },
    { title: "Date", value: "date", label: "Date" },
]

type SortOption = "total_score" | "accuracy" | "rank" | "date" | "performance"

export const ScoresTable = ({ userId: lockedUserId }: { userId?: number }) => {
    const [sort, setSort] = useState<SortOption[]>(["performance"])
    const [search, setSearch] = useState("")
    const [userId, setUserId] = useState<number | undefined>()
    const [roomDate, setRoomDate] = useState<string | undefined>()
    const [page, setPage] = useState(0)
    const [pageSize, setPageSize] = useState(25)

    const filteredUserId = lockedUserId ?? userId

    const { data, isLoading, isError } = trpc.dailyChallenge.getScores.useQuery(
        {
            limit: pageSize,
            cursor: page * pageSize,
            sort,
            userId: filteredUserId,
            roomDate,
        },
        {
            placeholderData: prev => prev,
            enabled:
                lockedUserId === undefined || Number.isFinite(lockedUserId),
        },
    )
    const { data: searchData, isLoading: isSearchLoading } =
        trpc.dailyChallenge.searchUser.useQuery(
            { query: search },
            { enabled: !!search && lockedUserId === undefined },
        )

    const router = useRouter()
    const onSearch = useMemo(() => debounce(setSearch, 500), [])

    const rowData = useMemo(() => {
        if (!data) return []
        return data.data.map((item: any, index: number) => ({
            key: item.id,
            id: item.user.id,
            position: pageSize * page + index + 1,
            username: item.user.username,
            country: item.user.country_code,
            total_score: item.total_score,
            accuracy: item.accuracy,
            rank: item.rank,
            mods: item.mods,
            pp: item.pp,
            ended_at: item.ended_at,
            room_id: item.room_id,
            beatmap: item.beatmap,
        }))
    }, [data, page, pageSize])

    if (isLoading) return <Loading />
    if (isError) return <div>Error loading scores</div>
    if (!data) return <div>No data</div>

    const onRow = (record: { id: number; ended_at?: string }) => ({
        onClick: () => {
            if (lockedUserId && record.ended_at) {
                router.push(
                    `/daily-challenge/detail/${dayjs(record.ended_at).format("YYYY-MM-DD")}`,
                )
                return
            }
            router.push(`/daily-challenge/user/${record.id}`)
        },
    })

    const pagination: TablePaginationConfig = {
        current: page + 1,
        pageSize,
        total: data.total,
        showSizeChanger: true,
        pageSizeOptions: PAGE_SIZE_OPTIONS.map(String),
        onChange: (newPage, newPageSize) => {
            setPage(newPage - 1)
            if (newPageSize !== pageSize) {
                setPageSize(newPageSize)
                setPage(0)
            }
        },
    }

    return (
        <>
            <Row className="flex-col" style={{ marginBottom: 16 }}>
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 12,
                        alignSelf: "flex-start",
                        width: "100%",
                    }}
                >
                    {lockedUserId === undefined && (
                        <Select
                            allowClear
                            showSearch
                            filterOption={false}
                            onSearch={onSearch}
                            placeholder="Filter by user"
                            notFoundContent={
                                !search ? (
                                    <></>
                                ) : isSearchLoading ? (
                                    <Spin />
                                ) : (
                                    <div>No results</div>
                                )
                            }
                            style={{ width: 220 }}
                            value={userId}
                            onChange={value => {
                                setUserId(value)
                                setPage(0)
                            }}
                            options={searchData?.map(item => ({
                                label: item.username,
                                value: item.id,
                                country: item.country,
                            }))}
                            optionRender={item => (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 8,
                                    }}
                                >
                                    <Image
                                        style={{ borderRadius: "50%" }}
                                        alt="avatar"
                                        src={`https://a.ppy.sh/${item.value}`}
                                        width={24}
                                        height={24}
                                    />
                                    {item.label}
                                </div>
                            )}
                        />
                    )}
                    <DatePicker
                        placeholder="Filter by date"
                        format="YYYY-MM-DD"
                        minDate={dayjs(firstDailyChallengeDate().toDate())}
                        maxDate={dayjs()}
                        allowClear
                        value={roomDate ? dayjs(roomDate) : null}
                        onChange={d => {
                            setRoomDate(d ? d.format("YYYY-MM-DD") : undefined)
                            setPage(0)
                        }}
                    />
                    <Select
                        mode="multiple"
                        style={{ minWidth: 280, flex: 1 }}
                        placeholder="Sort by"
                        onChange={(value: SortOption[]) => {
                            setSort(value.length ? value : ["performance"])
                            setPage(0)
                        }}
                        options={SORT_OPTIONS.filter(
                            el => !sort.includes(el.value as SortOption),
                        )}
                        value={sort}
                    />
                    <Select
                        style={{ width: 120 }}
                        value={pageSize}
                        onChange={value => {
                            setPageSize(value)
                            setPage(0)
                        }}
                        options={PAGE_SIZE_OPTIONS.map(size => ({
                            label: `${size} / page`,
                            value: size,
                        }))}
                    />
                </div>
            </Row>
            <Table
                pagination={pagination}
                style={{ width: "100%" }}
                tableLayout="fixed"
                dataSource={rowData}
                onRow={onRow}
                className="table-row-cursor-pointer scores-table"
            >
                <Table.Column
                    title="#"
                    dataIndex="position"
                    key="position"
                    width={48}
                />
                <Table.Column
                    title="Grade"
                    dataIndex="rank"
                    key="rank"
                    width={72}
                    render={rank => <Grade rank={rank} size={22} />}
                />
                {lockedUserId === undefined && (
                    <>
                        <Table.Column
                            title="Country"
                            dataIndex="country"
                            key="country"
                            width={80}
                            render={text => (
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                    }}
                                >
                                    <Flag code={text} height={20} />
                                </div>
                            )}
                        />
                        <Table.Column
                            title=""
                            dataIndex="id"
                            key="avatar"
                            width={65}
                            render={id => (
                                <Image
                                    style={{ borderRadius: "50%" }}
                                    alt="avatar"
                                    src={`https://a.ppy.sh/${id}`}
                                    width={50}
                                    height={50}
                                />
                            )}
                        />
                        <Table.Column
                            title="Username"
                            dataIndex="username"
                            width={130}
                            key="username"
                            ellipsis
                        />
                    </>
                )}
                <Table.Column
                    title="Beatmap"
                    dataIndex="beatmap"
                    key="beatmap"
                    width="32%"
                    render={beatmap => {
                        if (!beatmap) return "-"
                        const title = beatmap.beatmapset
                            ? `${beatmap.beatmapset.artist} - ${beatmap.beatmapset.title}`
                            : "Unknown beatmap"
                        return (
                            <div style={{ textAlign: "left", lineHeight: 1.3 }}>
                                <div style={{ fontWeight: 600 }}>
                                    {title}{" "}
                                    <span style={{ opacity: 0.75 }}>
                                        [{beatmap.version}]
                                    </span>
                                </div>
                                <div
                                    style={{
                                        fontSize: 12,
                                        opacity: 0.7,
                                        display: "flex",
                                        gap: 8,
                                        flexWrap: "wrap",
                                    }}
                                >
                                    <span>
                                        ★{" "}
                                        {beatmap.difficulty_rating?.toFixed(2)}
                                    </span>
                                    <span>
                                        {formatTime(beatmap.total_length ?? 0)}
                                    </span>
                                    <span>{beatmap.bpm} BPM</span>
                                    <span>CS {beatmap.cs}</span>
                                    <span>AR {beatmap.ar}</span>
                                    <span>OD {beatmap.accuracy}</span>
                                    <span>HP {beatmap.drain}</span>
                                </div>
                            </div>
                        )
                    }}
                />
                <Table.Column
                    title="Score"
                    dataIndex="total_score"
                    key="total_score"
                    width={110}
                    render={score => score?.toLocaleString()}
                />
                <Table.Column
                    title="Accuracy"
                    dataIndex="accuracy"
                    key="accuracy"
                    width={88}
                    render={accuracy =>
                        accuracy != null
                            ? `${(accuracy * 100).toFixed(2)}%`
                            : "-"
                    }
                />
                <Table.Column
                    title="PP"
                    dataIndex="pp"
                    key="pp"
                    width={78}
                    render={pp =>
                        pp != null
                            ? Number(pp.toFixed(0)).toLocaleString()
                            : "-"
                    }
                />
                <Table.Column
                    title="Mods"
                    dataIndex="mods"
                    key="mods"
                    render={mods => (
                        <div
                            style={{
                                display: "flex",
                                gap: 2,
                                justifyContent: "flex-start",
                                flexWrap: "wrap",
                            }}
                        >
                            {mods?.map(
                                (mod: { acronym: string }, i: number) => (
                                    <Mod
                                        key={`${mod.acronym}-${i}`}
                                        mod={mod}
                                        size={24}
                                    />
                                ),
                            )}
                        </div>
                    )}
                />
                <Table.Column
                    title="Date"
                    dataIndex="ended_at"
                    key="ended_at"
                    width={148}
                    render={date =>
                        date ? dayjs(date).format("YYYY-MM-DD HH:mm") : "-"
                    }
                />
            </Table>
        </>
    )
}
