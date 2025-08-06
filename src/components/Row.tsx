

export const Row = ({ children, style, className }: { children: React.ReactNode, style?: React.CSSProperties, className?: string }) => {
    return (
        <div className={`flex-row space-evenly ${className ?? ""}`} style={{ gap: 4, fontSize: 20, ...style }}>
            {children}
        </div>
    )
}