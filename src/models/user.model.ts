import mongoose, { Model, model, Schema } from "mongoose"

export interface IUser {
    id: string
    username: string
    blacklisted: boolean
    commands: number
    embedColor: null | string
    firstSeen: Date
    knownIps: string[]
    lastSeen: Date
    messages: number
    osuTemp: string | null
    interactions: {
        command: number
        button: number
        dropdown: number
    }
    osu?: {
        token: string
        tokenType: "Bearer"
        expiresIn: Date
        refreshToken: string
        scopes: string[]
        username: string
        userId: number
        country: string
        pp: number
        rank: number
        countryRank: number
    }
}

export type IClientUser = Partial<Pick<IUser, "id" | "username">> & {
    osu?: { username: string; userId: number }
}

export type IUserContext = IClientUser & {
    refetch: () => Promise<void>
}

const userSchema = new Schema<IUser>({
    id: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        required: true,
    },
    blacklisted: {
        type: Boolean,
        default: false,
    },
    commands: {
        type: Number,
        default: 0,
    },
    embedColor: {
        type: String,
        default: null,
    },
    firstSeen: {
        type: Date,
        default: Date.now,
    },
    knownIps: {
        type: [String],
        default: [],
    },
    lastSeen: {
        type: Date,
        default: Date.now,
    },
    messages: {
        type: Number,
        default: 0,
    },
    osuTemp: {
        type: String,
        default: null,
    },
    interactions: {
        command: {
            type: Number,
            default: 0,
        },
        button: {
            type: Number,
            default: 0,
        },
        dropdown: {
            type: Number,
            default: 0,
        },
    },
    osu: {
        token: {
            type: String,
            default: null,
        },
        tokenType: {
            type: String,
            default: "Bearer",
        },
        expiresIn: {
            type: Date,
            default: null,
        },
        refreshToken: {
            type: String,
            default: null,
        },
        scopes: {
            type: [String],
            default: [],
        },
        username: {
            type: String,
            default: null,
        },
        userId: {
            type: Number,
            default: null,
        },
        country: {
            type: String,
            default: null,
        },
        pp: {
            type: Number,
            default: 0,
        },
        rank: {
            type: Number,
            default: 0,
        },
        countryRank: {
            type: Number,
            default: 0,
        },
    },
})

const userModel = (): Model<IUser> => {
    return mongoose.models?.User || model<IUser>("User", userSchema, "users")
}

export default userModel
