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
  