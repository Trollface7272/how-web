import { Spin } from "antd"



export const Loading = ({ fullPage = false }: { fullPage?: boolean }) => {
    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: fullPage ? "100vh" : "100%" }}>
            <Spin />
        </div>
    )
}