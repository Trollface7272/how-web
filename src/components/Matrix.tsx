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
            <div className="matrix-cell" style={{ background: data?.color }}>
                {children}
            </div>
        </Tooltip>
    )
}


export const Matrix = (
    { data, legendData, defaultColor, from, to, minDate, maxDate }:
        { data: IMatrixData, legendData: { color: string, label: string }[], defaultColor: string, from?: Moment.Moment, to?: Moment.Moment, minDate?: Moment.Moment, maxDate?: Moment.Moment }) => {

    const chart = useMemo(() => {
        const cellData = data.CellData
        const cellDataArray = Object.keys(cellData)
        cellDataArray.sort((a, b) => {
            return new Date(a).getTime() - new Date(b).getTime()
        })

        const toDate = to ? to : moment().endOf("week")
        const fromDate = from ? from : moment(toDate).add(-365, "days").startOf("week")
        const weeks = moment.range(fromDate, toDate)
        const iterator = weeks.by("week")
        const matrix = []
        for (const week of iterator) {
            const row = []
            for (let i = 0; i < 7; i++) {
                let dColor = defaultColor
                const day = moment(week).day(i)
                if (maxDate && day.isSameOrAfter(maxDate)) dColor = "gray"
                if (minDate && day.isBefore(minDate)) dColor = "gray"
                row.push(
                    <MatrixCell data={data.CellData[day.format("YYYY-MM-DD")] || { date: day.toDate(), color: dColor }} key={day.format("YYYY-MM-DD")}></MatrixCell>
                )
            }
            matrix.push(
                <MatrixColumn key={week.format("YYYY-MM-DD")}>
                    {row}
                </MatrixColumn>
            )
        }
        return matrix
    }, [data, defaultColor, from, to])

    return (
        <div className="matrix">
            <MatrixRow>
                {chart}
            </MatrixRow>
            <Row className="justify-center" style={{ marginTop: 16 }}>
                {legendData.map((item) => (
                    <div key={item.label} style={{ paddingLeft: 8, paddingRight: 8 }}>
                        <span style={{ background: item.color, borderRadius: 4, width: 16, height: 16, display: "inline-block", marginRight: 4 }}></span>
                        {item.label}
                    </div>
                ))}
            </Row>
        </div>
    )
}