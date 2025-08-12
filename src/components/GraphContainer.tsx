import { theme } from "antd"

export const Container = ({
    children,
    title,
}: {
    children: React.ReactNode
    title: string
}) => {
    const { token } = theme.useToken()
    return (
        <div
            className="text-center"
            style={{
                backgroundColor: token.colorBgElevated,
                padding: 24,
                marginTop: 12,
            }}
        >
            <div
                style={{
                    width: "100%",
                    fontSize: 28,
                    fontWeight: "bold",
                    marginBottom: 16,
                }}
            >
                {title}
            </div>
            {children}
        </div>
    )
}
