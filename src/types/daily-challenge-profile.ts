export interface DailyChallengeUserData {
    top10Percent: Top10Percent
    top50Percent: Top50Percent
    country: string
    played: Played
}

export interface IDailyChallengeUser {
    _id: Id
    id: number
    dataIncludesChallenges: number[]
    played: Played
    scoreData: ScoreDaum[]
    top10Percent: Top10Percent
    top50Percent: Top50Percent
    username: string
    averagePlacement: number
    averagePlacementPercent: number
    country: string
    streakData: StreakData
    placements: UserPlacements
    statistics: {
        total_score: number
    }
}

export interface UserPlacements {
    rank1: Placement
    top1: Placement
    top5: Placement
    top10: Placement
    top25: Placement
    top50: Placement
    top75: Placement
    top100: Placement
    total: number
}

export interface StreakHistory {
    date: Date
    streak: number
}
export interface StreakData {
    currentStreak: number
    longestStreak: number
    streakHistory: StreakHistory[]
    updatedForChallenge: number
}

export interface Placement {
    rooms: number[]
    count: number
}

export interface Id {
    $oid: string
}

export interface Played {
    rooms: number[]
    count: number
}

export interface ScoreDaum {
    room_id: number
    score_id: number
    score: number
    accuracy: number
    rank: string
    max_combo: number
    pp: number
    mods: Mod[]
    position: number
    positionPercent: number
}

export interface Mod {
    acronym: string
    settings?: Record<string, any>
}

export interface Settings {
    speed_change: number
}

export interface Top10Percent {
    rooms: any[]
    count: number
}

export interface Top50Percent {
    rooms: any[]
    count: number
}
