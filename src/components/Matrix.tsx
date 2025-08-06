import { Tooltip } from "antd";
import Moment from "moment"
import { extendMoment } from 'moment-range';
import { ReactNode, useMemo } from "react";
import { Row } from "./Row";

//@ts-ignore
const moment = extendMoment(Moment)

export interface ICellData {
    date: Date
    color: string
    Tooltip: ReactNode
}

export interface IMatrixData {
    CellData: Record<string, ICellData>
}

export const MatrixRow = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="matrix-row">
            {children}
        </div>
    )
}

export const MatrixColumn = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="matrix-column">
            {children}
        </div>
    )
}

export const MatrixCell = ({ children, data }: { children?: React.ReactNode, data: ICellData }) => {
    return (
        <Tooltip title={data?.Tooltip}>
            <div className="matrix-cell" style={{ backgroundColor: data?.color }}>
                {children}
            </div>
        </Tooltip>
    )
}


export const Matrix = ({ data, legendData, defaultColor }: { data: IMatrixData, legendData: { color: string, label: string }[], defaultColor: string }) => {

    const chart = useMemo(() => {
        const cellData = data.CellData
        const cellDataArray = Object.keys(cellData)
        cellDataArray.sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime()
        })

        const toDate = moment().endOf("week")
        const fromDate = moment(toDate).add(-365, "days").startOf("week")
        const weeks = moment.range(fromDate, toDate)
        const iterator = weeks.by("week")
        const matrix = []
        for (const week of iterator) {
            const row = []
            for (let i = 0; i < 7; i++) {
                let dColor = defaultColor
                const day = moment(week).day(i)
                if (day.isSameOrAfter(moment().startOf("day"))) dColor = "transparent"
                row.push(
                    <MatrixCell data={data.CellData[day.format("YYYY-MM-DD")] || { date: day.toDate(), color: dColor }} key={day.format("YYYY-MM-DD")}></MatrixCell>
                )
            }
            matrix.push(
                <MatrixColumn>
                    {row}
                </MatrixColumn>
            )
        }
        return matrix
    }, [data, defaultColor])

    return (
        <div className="matrix">
            <MatrixRow>
                {chart}
            </MatrixRow>
            <Row className="justify-center" style={{ marginTop: 16 }}>
                {legendData.map((item) => (
                    <div key={item.label} style={{ paddingLeft: 8, paddingRight: 8 }}>
                        <span style={{ backgroundColor: item.color, borderRadius: 4, width: 16, height: 16, display: "inline-block", marginRight: 4 }}></span>
                        {item.label}
                    </div>
                ))}
            </Row>
        </div>
    )
}