import { Tooltip } from "antd"
import { Mod as IMod } from "../types/daily-challenge-profile"
import { modAcronyms } from "../utils/osu"

const modConfig = {
    "NM": {
        type: "System"
    },

    "DC": {
        type: "DifficultyReduction"
    },
    "HT": {
        type: "DifficultyReduction"
    },
    "NF": {
        type: "DifficultyReduction"
    },

    "AC": {
        type: "DifficultyIncrease"
    },
    "BL": {
        type: "DifficultyIncrease"
    },
    "DT": {
        type: "DifficultyIncrease"
    },
    "HD": {
        type: "DifficultyIncrease"
    },
    "FL": {
        type: "DifficultyIncrease"
    },
    "HR": {
        type: "DifficultyIncrease"
    },
    "NC": {
        type: "DifficultyIncrease"
    },
    "PF": {
        type: "DifficultyIncrease"
    },
    "SD": {
        type: "DifficultyIncrease"
    },
    "ST": {
        type: "DifficultyIncrease"
    },

    "AL": {
        type: "Conversion"
    },
    "CL": {
        type: "Conversion"
    },
    "DA": {
        type: "Conversion"
    },
    "MR": {
        type: "Conversion"
    },
    "RD": {
        type: "Conversion"
    },
    "SG": {
        type: "Conversion"
    },
    "TP": {
        type: "Conversion"
    },

    "AP": {
        type: "Automation"
    },
    "RX": {
        type: "Automation"
    },
    "SO": {
        type: "Automation"
    },

    "AD": {
        type: "Fun"
    },
    "AS": {
        type: "Fun"
    },
    "BM": {
        type: "Fun"
    },
    "BR": {
        type: "Fun"
    },
    "BU": {
        type: "Fun"
    },
    "DF": {
        type: "Fun"
    },
    "DP": {
        type: "Fun"
    },
    "FR": {
        type: "Fun"
    },
    "GR": {
        type: "Fun"
    },
    "MG": {
        type: "Fun"
    },
    "MU": {
        type: "Fun"
    },
    "NS": {
        type: "Fun"
    },
    "RP": {
        type: "Fun"
    },
    "SI": {
        type: "Fun"
    },
    "SY": {
        type: "Fun"
    },
    "TC": {
        type: "Fun"
    },
    "TF": {
        type: "Fun"
    },
    "WD": {
        type: "Fun"
    },
    "WG": {
        type: "Fun"
    },
    "WU": {
        type: "Fun"
    },

    "TD": {
        type: "System"
    }
}

export const Mod = ({ mod }: { mod: IMod }) => {
    const conf = modConfig[mod.acronym as keyof typeof modConfig]
    if (!conf) return <></>
    return (
        <Tooltip title={modAcronyms[mod.acronym as keyof typeof modAcronyms]}>
            <div className={`mod mod--type-${conf.type}`}>
                <div className={`mod__icon mod__icon--${mod.acronym}`} data-acronym={mod.acronym}></div>
            </div>
        </Tooltip>

    )
}