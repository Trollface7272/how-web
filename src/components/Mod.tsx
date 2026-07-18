import { Tooltip } from "antd"
import { Mod as IMod } from "../types/daily-challenge-profile"
import { modNames, ModNameEntry } from "../utils/osu/mod-names"

const numberFormatter = new Intl.NumberFormat("en")

function format(value: unknown) {
    if (typeof value === "boolean") {
        return value ? "on" : "off"
    }
    if (typeof value === "number") {
        return numberFormatter.format(value)
    }
    return String(value)
}

function formatNumberWithPrecision(value: number, precision: number) {
    return value.toLocaleString("en", {
        maximumFractionDigits: precision,
        minimumFractionDigits: precision,
    })
}

function modDetails(mod: IMod): ModNameEntry {
    return (
        modNames[mod.acronym] ?? {
            acronym: mod.acronym,
            name: mod.acronym,
            type: "Fun",
            setting_labels: {},
            icon: "",
        }
    )
}

function settingsLabel(modJson: ModNameEntry, mod: IMod) {
    const settings: string[] = []
    for (const [setting, value] of Object.entries(mod.settings ?? {})) {
        if (setting === "speed_change") {
            settings.push(`${format(value)}×`)
        } else {
            const label = modJson.setting_labels[setting]
            if (label != null) {
                settings.push(`${label}: ${format(value)}`)
            }
        }
    }
    return settings
}

type ExtendedContentDisplayCandidate = {
    acronym: string
    significantDigits: number
}

export function getExtendedContent(mod: IMod): string {
    switch (mod.acronym) {
        case "HT":
        case "DC":
        case "DT":
        case "NC": {
            const speedChange = mod.settings?.speed_change as number | undefined
            return speedChange != null
                ? `${formatNumberWithPrecision(speedChange, 2)}×`
                : ""
        }
        case "DA": {
            const displayCandidates: Record<
                string,
                ExtendedContentDisplayCandidate
            > = {
                approach_rate: { acronym: "AR", significantDigits: 1 },
                circle_size: { acronym: "CS", significantDigits: 1 },
                drain_rate: { acronym: "HP", significantDigits: 1 },
                overall_difficulty: { acronym: "OD", significantDigits: 1 },
                scroll_speed: { acronym: "SS", significantDigits: 2 },
            }

            let displayCandidate: ExtendedContentDisplayCandidate | undefined
            let displayValue: number | undefined

            for (const [key, setting] of Object.entries(displayCandidates)) {
                const settingValue = mod.settings?.[key]
                if (typeof settingValue === "number") {
                    if (displayCandidate !== undefined) {
                        return ""
                    }
                    displayValue = settingValue
                    displayCandidate = setting
                }
            }

            if (displayCandidate != null && displayValue != null) {
                return `${displayCandidate.acronym}${formatNumberWithPrecision(
                    displayValue,
                    displayCandidate.significantDigits,
                )}`
            }
            return ""
        }
        default:
            return ""
    }
}

export const Mod = ({
    mod,
    size = "1em",
    extendedContent,
    hideNameInTitle = false,
}: {
    mod: IMod
    size?: number | string
    extendedContent?: string
    hideNameInTitle?: boolean
}) => {
    const modJson = modDetails(mod)
    const content = extendedContent ?? getExtendedContent(mod)
    const hasSettings = Object.keys(mod.settings ?? {}).length > 0

    let title = settingsLabel(modJson, mod).join(", ")
    if (!hideNameInTitle) {
        title = `${modJson.name}${title === "" ? "" : ` (${title})`}`
    }

    return (
        <Tooltip title={title || mod.acronym}>
            <div
                className={`mod mod--type-${modJson.type}`}
                style={{
                    fontSize: typeof size === "number" ? `${size}px` : size,
                }}
            >
                <div
                    className={`mod__icon mod__icon--${mod.acronym}`}
                    data-acronym={mod.acronym}
                />
                {content !== "" && (
                    <div className="mod__extender">
                        <span>{content}</span>
                    </div>
                )}
                {hasSettings && (
                    <div className="mod__customised-indicator">
                        <div className="mod__customised-indicator-icon" />
                    </div>
                )}
            </div>
        </Tooltip>
    )
}
