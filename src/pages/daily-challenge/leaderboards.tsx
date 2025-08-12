"use client"
import { Input, Select, Spin, Table, TablePaginationConfig } from "antd"
import { useMemo, useState } from "react"
import { Container } from "../../components/GraphContainer"
import { trpc } from "../../utils/trpc"
import Flag from "react-world-flags"
import Image from "next/image"
import { useRouter } from "next/router"
import { debounce } from "../../utils/helpers"
import { SearchSelectUserRow } from "../../components/SearchSelectUserRow"
import { Loading } from "../../components/Loading"

const PER_PAGE = 10

const Leaderboards = () => {
    const [search, setSearch] = useState("")
    const [page, setPage] = useState(0)

    const { data, isLoading, isError, isFetching } =
        trpc.dailyChallenge.getLeaderboards.useQuery(
            { limit: PER_PAGE, cursor: page * PER_PAGE },
            {
                placeholderData: (prev) => prev,
            },
        )
    const { data: searchData, isLoading: isSearchLoading } =
        trpc.dailyChallenge.searchUser.useQuery(
            { query: search },
            { enabled: !!search },
        )

    const router = useRouter()

    const onSearch = useMemo(() => {
        return debounce(setSearch, 500)
    }, [])

    const rowData = useMemo(() => {
        if (!data) return []
        return (
            data.data.map((item, index) => ({
                key: item.id,
                id: item.id,
                rank: PER_PAGE * page + index + 1,
                username: item.username,
                country: item.country,
                played: item.placements.top100.count,
                rank1: item.placements.rank1.count,
                top1: item.placements.top1.count,
                top5: item.placements.top5.count,
                top10: item.placements.top10.count,
                top25: item.placements.top25.count,
                top50: item.placements.top50.count,
                top75: item.placements.top75.count,
            })) || []
        )
    }, [data, page])

    if (isLoading) return <Loading fullPage />
    if (isError) return <div>Error loading leaderboards</div>
    if (!data) return <div>No data</div>

    const onRow = (record: any) => ({
        onClick: () => {
            router.push(`/daily-challenge/user/${record.id}`)
        },
    })

    const pagination: TablePaginationConfig = {
        onChange: (newPage) => {
            setPage(newPage - 1)
        },
        total: data.total,
    }

    return (
        <Container title="Leaderboards">
            <div>
                <Select
                    labelInValue
                    showSearch={true}
                    filterOption={false}
                    onSearch={onSearch}
                    notFoundContent={
                        !search ? (
                            <></>
                        ) : isSearchLoading ? (
                            <Spin />
                        ) : (
                            <div>No results</div>
                        )
                    }
                    style={{ width: 200 }}
                    options={searchData?.map((item) => ({
                        label: item.username,
                        value: item.id,
                    }))}
                    optionRender={(item) => (
                        <SearchSelectUserRow
                            username={item.label!.toString()}
                            id={item.value!.toString()}
                            link={`/daily-challenge/user/${item.value}`}
                        />
                    )}
                />
            </div>
            <Table
                pagination={pagination}
                style={{ width: "100%" }}
                dataSource={rowData}
                onRow={onRow}
                className="table-row-cursor-pointer"
            >
                <Table.Column
                    title="Rank"
                    dataIndex="rank"
                    key="rank"
                    width={"1%"}
                />
                <Table.Column
                    title="Country"
                    dataIndex="country"
                    width={50}
                    key="country"
                    render={(text) => (
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                width: 50,
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
                    key="id"
                    width={50}
                    render={(id) => (
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
                    width={"15%"}
                    key="username"
                />
                <Table.Column
                    title="Played"
                    dataIndex="played"
                    width={100}
                    key="played"
                />
                <Table.Column
                    title="Rank 1"
                    dataIndex="rank1"
                    width={100}
                    key="rank1"
                    render={(text) => (
                        <span className="text-rank-1">{text}</span>
                    )}
                />
                <Table.Column
                    title="Top 1%"
                    dataIndex="top1"
                    width={100}
                    key="top1"
                    render={(text) => (
                        <span className="text-top-1">{text}</span>
                    )}
                />
                {/* <Table.Column title="Top 5%" dataIndex="top5" width={100} key="top5" /> */}
                <Table.Column
                    title="Top 10%"
                    dataIndex="top10"
                    width={100}
                    key="top10"
                    render={(text) => (
                        <span className="text-top-10">{text}</span>
                    )}
                />
                {/* <Table.Column title="Top 25%" dataIndex="top25" width={100} key="top25" /> */}
                <Table.Column
                    title="Top 50%"
                    dataIndex="top50"
                    key="top50"
                    render={(text) => (
                        <span className="text-top-50">{text}</span>
                    )}
                />
                {/* <Table.Column title="Top 75%" dataIndex="top75" key="top75" /> */}
            </Table>
        </Container>
    )
}

export default Leaderboards
