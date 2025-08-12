export interface IDailyChallengeScore {
    id: number
    room_id: number
    user: User
    accuracy: number
    beatmap_id: number
    best_id: any
    build_id: number
    classic_total_score: number
    current_user_attributes: CurrentUserAttributes
    ended_at: string
    has_replay: boolean
    index: any
    is_perfect_combo: boolean
    legacy_perfect: boolean
    legacy_score_id: any
    legacy_total_score: number
    match: any
    max_combo: number
    maximum_statistics: MaximumStatistics
    mods: Mod[]
    passed: boolean
    playlist_item_id: number
    position: number
    pp: any
    preserve: boolean
    processed: boolean
    rank: string
    ranked: boolean
    replay: boolean
    ruleset_id: number
    scores_around: any
    solo_score_id: number
    started_at: string
    statistics: Statistics
    temporary: boolean
    total_score: number
    total_score_without_mods: number
    type: string
    user_id: number
}

export interface User {
    avatar_url: string
    country_code: string
    default_group: string
    id: number
    is_active: boolean
    is_bot: boolean
    is_deleted: boolean
    is_online: boolean
    is_supporter: boolean
    last_visit: any
    pm_friends_only: boolean
    profile_colour: any
    username: string
    country: Country
    cover: Cover
}

export interface Country {
    code: string
    name: string
}

export interface Cover {
    custom_url: string
    url: string
    id: any
}

export interface CurrentUserAttributes {
    pin: any
}

export interface MaximumStatistics {
    great: number
    ignore_hit: number
    large_tick_hit: number
    slider_tail_hit: number
}

export interface Mod {
    acronym: string
    settings?: Settings
}

export interface Settings {
    speed_change: number
}

export interface Statistics {
    great: number
    ignore_hit: number
    large_tick_hit: number
    slider_tail_hit: number
}
