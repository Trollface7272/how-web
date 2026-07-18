import { Spin } from "antd"

export const Loading = ({ fullPage = false }: { fullPage?: boolean }) => {
    return (
        <div className={`page-loading${fullPage ? " page-loading--full" : ""}`}>
            <Spin size={fullPage ? "large" : "default"} />
        </div>
    )
}
