import "../styles/globals.css";
import "../styles/mods.css";
import type { AppProps } from "next/app";
import { Avatar, ConfigProvider, Layout, Menu, theme } from "antd";
import { useContext, useEffect, useState } from "react";
import { LoginOutlined, LogoutOutlined } from "@ant-design/icons";
const { Content, Sider } = Layout;
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { usePathname } from "next/navigation"
import { IUserContext } from "../models/user.model";
import { UserContext } from "../context/User";
import { Row } from "../components/Row";
import { deleteCookie } from "cookies-next/client"

const LoginButton = () => {
    return (
        <Menu.Item key="logged-user" style={{ paddingLeft: "24px" }}>
            <Link href={process.env.NEXT_PUBLIC_OSU_LINK_URL!}>
                <LoginOutlined />
                <span>Log In</span>
            </Link>
        </Menu.Item>
    )
}
const ProfileButton = () => {
    const user = useContext<IUserContext | null>(UserContext)!
    return (
        <Menu.Item key={`/daily-challenge/user/${user.osu?.userId}`}>
            <Row>
                <Link href={`/daily-challenge/user/${user.osu?.userId}`} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
                    <Avatar style={{ marginLeft: 18, height: 24, width: 24 }} alt="Avatar" src={`https://a.ppy.sh/${user.osu?.userId}`} />
                    <span style={{ fontSize: 14, marginLeft: 5 }}>{user.osu?.username}</span>
                </Link>
                <LogoutOutlined style={{ zIndex: 1000 }} onClick={async (e) => {
                    e.stopPropagation()
                    await fetch("/api/logout")
                    user.refetch()
                }} />
            </Row>
        </Menu.Item>
    )
}


const SideMenu = () => {
    const href = usePathname() ?? ""
    const [collapsed, setCollapsed] = useState(false);
    const user = useContext<IUserContext | null>(UserContext)

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
            >
                {user?.id ? <ProfileButton /> : <LoginButton />}
                <Menu.SubMenu key={"daily-challenge-group"} title="Daily challenge">
                    <Menu.Item key="/daily-challenge/stats">
                        <Link href="/daily-challenge/stats">
                            <span>Stats</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="/daily-challenge/detail/current">
                        <Link href="/daily-challenge/detail/current">
                            <span>Current</span>
                        </Link>
                    </Menu.Item>
                    <Menu.Item key="/daily-challenge/leaderboards">
                        <Link href="/daily-challenge/leaderboards">
                            <span>Leaderboards</span>
                        </Link>
                    </Menu.Item>
                </Menu.SubMenu>
            </Menu>
        </Sider>
    )
}

const App = ({ Component, pageProps }: AppProps) => {
    const { data: user, refetch: _refetch } = trpc.user.getLoggedUser.useQuery()
    const t = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorBgContainer: "#141414",
        }
    }

    const refetch = async () => { _refetch() }

    if (typeof window !== 'undefined') {
        window.onload = () => {
            document.getElementById('holderStyle')!.remove();
        };
    }

    useEffect(() => {
        document.getElementById('holderStyle')?.remove();
    })

    return (
        <UserContext.Provider value={user ? {
            ...user,
            refetch
        } : { refetch }}>
            <ConfigProvider theme={t} >
                <Layout style={{ minHeight: "100vh" }}>

                    <SideMenu />

                    <Layout className="site-layout" style={{ overflowY: "scroll", overflowX: "hidden" }}>
                        <Content style={{ margin: "0 16px" }}>
                            <Component {...pageProps} />
                        </Content>
                    </Layout>
                </Layout>
            </ConfigProvider>
        </UserContext.Provider>
    );
};

export default trpc.withTRPC(App);
