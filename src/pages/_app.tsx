import "../styles/globals.css";
import "../styles/mods.css";
import type { AppProps } from "next/app";
import Image from "next/image";

import { Avatar, ConfigProvider, Layout, Menu, theme } from "antd";
import { createContext, useContext, useState } from "react";
import type { MenuProps } from "antd";
import {
    UserOutlined,
    LoginOutlined
} from "@ant-design/icons";
const { Content, Sider } = Layout;
import { trpc } from "../utils/trpc";
import Link from "next/link";
import { usePathname } from "next/navigation"
import { IClientUser, IUser } from "../models/user.model";
import { UserContext } from "../context.ts/User";

type MenuItem = Required<MenuProps>["items"][number];

function getItem(
    label: React.ReactNode,
    key: React.Key,
    icon?: React.ReactNode,
    children?: MenuItem[]
): MenuItem {
    return {
        key,
        icon,
        children,
        label,
    } as MenuItem;
}

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
    const user = useContext<IClientUser | null>(UserContext)!
    return (
        <Menu.Item key="logged-user">
            <Link href={"/profile"} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center" }}>
                <Avatar style={{ marginLeft: 18, height: 24, width: 24 }} alt="Avatar" src={`https://a.ppy.sh/${user.osu?.userId}`} />
                <span style={{ fontSize: 14, marginLeft: 5 }}>{user.osu?.username}</span>
            </Link>
        </Menu.Item>
    )
}


const SideMenu = () => {
    const href = usePathname() ?? ""
    const [collapsed, setCollapsed] = useState(false);
    const user = useContext<IClientUser | null>(UserContext)

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
                {user ? <ProfileButton /> : <LoginButton />}
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
    const { data: user } = trpc.user.getLoggedUser.useQuery()
    const t = {
        algorithm: theme.darkAlgorithm,
        token: {
            colorBgContainer: "#141414",
        }
    }

    return (
        <UserContext.Provider value={user ?? null}>
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
