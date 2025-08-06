

export const Box = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex-col justify-center" style={{ gap: 16, marginTop: 16 }}>
            {children}
        </div>
    )
}