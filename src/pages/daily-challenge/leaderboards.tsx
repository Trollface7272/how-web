import { Input, Select, Spin, Table, TablePaginationConfig } from "antd"
import { useMemo, useState } from "react"
import { Container } from "../../components/GraphContainer"
import { trpc } from "../../utils/trpc"
import Flag from 'react-world-flags'
import Image from "next/image"
import { useRouter } from "next/router"
import { debounce } from "../../utils/helpers"
import { SearchSelectUserRow } from "../../components/SearchSelectUserRow"

const PER_PAGE = 10

const Leaderboards = () => {
    const [search, setSearch] = useState("")
    const { data, isLoading, isError, fetchNextPage, hasNextPage } =
        trpc.dailyChallenge.getLeaderboards.useInfiniteQuery({ limit: PER_PAGE })
    const { data: searchData, isLoading: isSearchLoading, isError: isSearchError } = trpc.dailyChallenge.searchUser.useQuery({ query: search }, { enabled: !!search })
    const [page, setPage] = useState(0)
    const router = useRouter()

    const onSearch = useMemo(() => {
        return debounce(setSearch, 500)
    }, [])

    const rowData = useMemo(() => {
        if (!data?.pages) return []
        const record = data.pages.find(p => p.page === page)
        if (!record) return []
        return record.data.map((item, index) => ({
            key: item.id,
            id: item.id,
            rank: (PER_PAGE * page) + index + 1,
            username: item.username,
            country: item.country,
            played: item.played.count,
            top10Percent: item.top10Percent.count,
            top50Percent: item.top50Percent.count
        })) || []
    }, [data, page])

    if (isLoading) return <div>Loading...</div>
    if (isError) return <div>Error loading leaderboards</div>
    if (!data) return <div>No data</div>

    const onRow = (record: any) => ({
        onClick: () => {
            router.push(`/daily-challenge/user/${record.id}`)
        }
    })

    const pagination: TablePaginationConfig = {
        onChange: (page) => {
            if (!data.pages[page - 1]) fetchNextPage({ pageParam: (page - 1) * PER_PAGE })
            setPage(page - 1)
        }, total: data.pages[0].total
    }

    return (
        <Container title="Leaderboards">
            <div>
                <Select
                    labelInValue
                    showSearch={true}
                    filterOption={false}
                    onSearch={onSearch}
                    notFoundContent={!search ? <></> : (isSearchLoading ? <Spin /> : <div>No results</div>)}
                    style={{ width: 200 }}
                    options={searchData?.map((item) => ({ label: item.username, value: item.id }))}
                    optionRender={(item) => <SearchSelectUserRow username={item.label!.toString()} id={item.value!.toString()} link={`/daily-challenge/user/${item.value}`} />}
                />
            </div>
            <Table pagination={pagination} style={{ width: "100%" }} dataSource={rowData} onRow={onRow} className="table-row-cursor-pointer">
                <Table.Column title="Rank" dataIndex="rank" key="rank" width={"1%"} />
                <Table.Column title="Country" dataIndex="country" width={50} key="country" render={(text) => <div style={{ display: "flex", alignItems: "center", gap: 8, width: 50, justifyContent: "center" }}><Flag code={text} height={20} /></div>} />
                <Table.Column title="" dataIndex="id" key="id" width={50} render={(id) => <Image style={{ borderRadius: "50%" }} alt="avatar" src={`https://a.ppy.sh/${id}`} width={50} height={50} />} />
                <Table.Column title="Username" dataIndex="username" width={"20%"} key="username" />
                <Table.Column title="Played" dataIndex="played" width={100} key="played" />
                <Table.Column title="Top 10%" dataIndex="top10Percent" width={100} key="top10Percent" />
                <Table.Column title="Top 50%" dataIndex="top50Percent" key="top50Percent" />
            </Table>
        </Container>
    )
}


export default Leaderboards