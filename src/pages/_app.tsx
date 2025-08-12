import "../styles/globals.css"
import type { AppProps } from "next/app"
import { Avatar, ConfigProvider, Layout, Menu, MenuProps, theme } from "antd"
import { useContext, useEffect, useMemo, useState } from "react"
import {
    BarChartOutlined,
    CalendarOutlined,
    LoginOutlined,
    LogoutOutlined,
    TrophyOutlined,
} from "@ant-design/icons"
const { Content, Sider } = Layout
import { trpc } from "../utils/trpc"
import { usePathname } from "next/navigation"
import { IUserContext } from "../models/user.model"
import { UserContext } from "../context/User"
import { MenuItemGroupType, MenuItemType } from "antd/es/menu/interface"
import { useRouter } from "next/router"

type MenuItem = Required<MenuProps>["items"][number]

const MenuItems: MenuItem[] = [
    {
        label: "Daily challenge",
        type: "group",
        key: "daily-challenge-group",
        children: [
            {
                label: "Stats",
                key: "/daily-challenge/stats",
                icon: <BarChartOutlined />,
            },
            {
                label: "Current",
                key: "/daily-challenge/detail/current",
                icon: <CalendarOutlined />,
            },
            {
                label: "Leaderboards",
                key: "/daily-challenge/leaderboards",
                icon: <TrophyOutlined />,
            },
        ],
    },
]

const LoginButton = () => {
    return {
        label: "Login",
        key: "/login",
        icon: <LoginOutlined />,
        onClick: () => {
            window.location.href = process.env.NEXT_PUBLIC_OSU_LINK_URL!
        },
    }
}
const ProfileButton = (collapsed: boolean) => {
    const user = useContext<IUserContext | null>(UserContext)!
    return {
        className: collapsed ? "avatar-collapsed" : "",
        label: user.osu?.username,
        icon: <Avatar src={`https://a.ppy.sh/${user.osu?.userId}`} />,
        key: "/daily-challenge/user/" + user.osu?.userId,
        extra: (
            <LogoutOutlined
                onClick={async (e) => {
                    e.stopPropagation()
                    await fetch("/api/logout")
                    user.refetch()
                }}
            />
        ),
    } as MenuItem
}

const SideMenu = () => {
    const href = usePathname() ?? ""
    const [collapsed, setCollapsed] = useState(false)
    const user = useContext<IUserContext | null>(UserContext)
    const router = useRouter()

    const menuItems = useMemo(() => {
        const items = [
            user?.id ? ProfileButton(collapsed) : LoginButton(),
            ...MenuItems,
        ]
        const group = items.find(
            (el) => el?.key === "daily-challenge-group",
        ) as MenuItemGroupType<MenuItemType>
        group!.className = collapsed ? "group-title-text-hidden" : ""
        return items
    }, [MenuItems, user, collapsed])

    const onClick = (path: string) => {
        if (path === "/login") return
        router.push(path)
    }

    return (
        <Sider
            collapsible
            collapsed={collapsed}
            onCollapse={(value) => setCollapsed(value)}
        >
            <Menu
                defaultSelectedKeys={[href]}
                defaultOpenKeys={["daily-challenge-group"]}
                mode="inline"
                style={{ minHeight: "100vh" }}
                items={menuItems}
                onClick={(item) => onClick(item.key)}
            />
        </Sider>
    )
}

const App = ({ Component, pageProps }: AppProps) => {
    const { data: user, refetch: _refetch } = trpc.user.getLoggedUser.useQuery()
    const t = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorBgContainer: "#141414",
        },
    }

    const refetch = async () => {
        _refetch()
    }

    if (typeof window !== "undefined") {
        window.onload = () => {
            document.getElementById("holderStyle")!.remove()
        }
    }

    useEffect(() => {
        document.getElementById("holderStyle")?.remove()
    })

    return (
        <UserContext.Provider
            value={
                user
                    ? {
                          ...user,
                          refetch,
                      }
                    : { refetch }
            }
        >
            <ConfigProvider theme={t}>
                <Layout style={{ minHeight: "100vh" }}>
                    <SideMenu />

                    <Layout
                        className="site-layout"
                        style={{ overflowY: "scroll", overflowX: "hidden" }}
                    >
                        <Content style={{ margin: "0 16px" }}>
                            <Component {...pageProps} />
                        </Content>
                    </Layout>
                </Layout>
            </ConfigProvider>
        </UserContext.Provider>
    )
}

export default trpc.withTRPC(App)
