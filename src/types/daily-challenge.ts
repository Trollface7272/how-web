import { DeepPick } from "ts-deep-pick"
import { UserPlacements } from "./daily-challenge-profile"
import { IDailyChallengeScore } from "./daily-challenge-score"

export interface GetDailyChallengeResponse {
    dailyChallenge: DailyChallengeData[]
    retentionData: RetentionData
}

export type RetentionData = {
    total: Record<number, number>
    country: Record<string, Record<number, number>>
}

export interface GetCurrentChallengeResponse {
    currentChallenge: Pick<CurrentPlaylistItem, "beatmap" | "required_mods">
    thresholds: Thresholds[]
    currentUserScore: GetCurrentChallengeUserScore
}

export type GetCurrentChallengeUserScore = Pick<
    IDailyChallengeScore,
    "id" | "total_score" | "position"
>

export interface GetLeaderboardsResponse {
    username: string
    id: string
    country: string
    played: {
        count: number
    }
    placements: DeepPick<
        UserPlacements,
        | "rank1.count"
        | "top1.count"
        | "top5.count"
        | "top10.count"
        | "top25.count"
        | "top50.count"
        | "top75.count"
        | "top100.count"
    >
    statistics: {
        totalScore: number
        pp: number
    }
}

export interface GetUserResponse {
    username: string
    id: string
    country: string
    played: {
        count: number
    }
    top10Percent: {
        count: number
    }
    top50Percent: {
        count: number
    }
    scoreData: {
        room_id: number
        score_id: number
        score: number
        accuracy: number
        rank: string
        date: string
        position: number
        positionPercent: number
    }[]
    averagePlacement: number
    averagePlacementPercent: number
    statistics: {
        totalScore: number
        accuracy: number
        pp: number
        totalPP: number
    }
    ppRank: number | null
    rankHistory: {
        date: string
        rank: number
    }[]
}

export interface DailyChallengeData {
    total: number
    starts_at: string
    ends_at: string
    thresholds: Thresholds
    current_playlist_item: Pick<
        CurrentPlaylistItem,
        "required_mods" | "room_id"
    >
    modData: ModData
}

export interface IDailyChallenge {
    active: boolean
    auto_skip: boolean
    category: string
    channel_id: number
    current_playlist_item: CurrentPlaylistItem
    difficulty_range: DifficultyRange
    ends_at: Date
    fetchedScores: boolean
    has_password: boolean
    host: Host
    id: number
    index: number
    max_attempts: any
    name: string
    participant_count: number
    playlist_item_stats: PlaylistItemStats
    queue_mode: string
    recent_participants: RecentParticipant[]
    starts_at: Date
    type: string
    user_id: number
    total: number
    lastUpdated: Date
    thresholds: Thresholds[]
    modData: ModData
}

export interface ModData {
    single: {
        [key: string]: {
            total: number
            mod: string
        }
    }
    combinations: {
        [key: string]: {
            total: number
            mods: string[]
        }
    }
}

export interface Thresholds {
    date: string
    rank1: ThresholdsPlacement
    top1: ThresholdsPlacement
    top10: ThresholdsPlacement
    top25: ThresholdsPlacement
    top50: ThresholdsPlacement
    top75: ThresholdsPlacement
    total: number
}

export interface ThresholdsPlacement {
    position: number
    score: number
}

export interface CurrentPlaylistItem {
    id: number
    room_id: number
    beatmap_id: number
    ruleset_id: number
    allowed_mods: Mods[]
    required_mods: Mods[]
    expired: boolean
    owner_id: number
    playlist_order: any
    played_at: Date
    beatmap: Beatmap
}

export interface Mods {
    acronym: string
    settings?: Record<string, any>
}

export interface Beatmap {
    beatmapset_id: number
    difficulty_rating: number
    id: number
    mode: string
    status: string
    total_length: number
    user_id: number
    version: string
    accuracy: number
    ar: number
    bpm: number
    convert: boolean
    count_circles: number
    count_sliders: number
    count_spinners: number
    cs: number
    deleted_at?: any
    drain: number
    hit_length: number
    is_scoreable: boolean
    last_updated: string
    mode_int: number
    passcount: number
    playcount: number
    ranked: number
    url: string
    checksum: string
    beatmapset: Beatmapset
    failtimes: Failtimes
    max_combo: number
    mods: ModsArray
}

export interface Beatmapset {
    artist: string
    artist_unicode: string
    covers: Covers
    creator: string
    favourite_count: number
    id: number
    nsfw: boolean
    play_count: number
    preview_url: string
    source: string
    status: string
    title: string
    title_unicode: string
    user_id: number
    video: boolean
    track_id: number
    hype?: any
    offset: number
    spotlight: boolean
    bpm: number
    can_be_hyped: boolean
    deleted_at?: any
    discussion_enabled: boolean
    discussion_locked: boolean
    is_scoreable: boolean
    last_updated: string
    legacy_thread_url: string
    nominations_summary: NominationsSummary
    ranked: number
    ranked_date: string
    storyboard: boolean
    submitted_date: string
    tags: string
    availability: Availability
    ratings: number[]
    nominations?: any
}

export interface Covers {
    cover: string
    "cover@2x": string
    card: string
    "card@2x": string
    list: string
    "list@2x": string
    slimcover: string
    "slimcover@2x": string
}

export interface NominationsSummary {
    current: number
    eligible_main_rulesets: string[]
    required_meta: RequiredMeta
}

export interface RequiredMeta {
    main_ruleset: number
    non_main_ruleset: number
}

export interface Availability {
    download_disabled: boolean
    more_information?: any
}

export interface Failtimes {
    fail: number[]
    exit: number[]
}

export interface ModsArray {
    mods: any[]
}

export interface DifficultyRange {
    max: number
    min: number
}

export interface Host {
    avatar_url: string
    country_code: string
    default_group: string
    id: number
    is_bot: boolean
    is_active: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean
    last_visit: string
    pm_friends_only: boolean
    profile_colour: string
    username: string
    global_rank: any
    country: Country
}

export interface Country {
    code: string
    name: string
}

export interface PlaylistItemStats {
    count_active: number
    count_total: number
    ruleset_ids: number[]
}

export interface RecentParticipant {
    avatar_url: string
    country_code: string
    default_group: string
    id: number
    is_bot: boolean
    is_active: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean
    last_visit?: string
    pm_friends_only: boolean
    profile_colour: any
    username: string
    global_rank: any
}
