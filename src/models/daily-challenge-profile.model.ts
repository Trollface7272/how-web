import mongoose, { Model, model, Schema } from "mongoose"
import { IDailyChallengeUser } from "../types/daily-challenge-profile"

const userSchema = new Schema<IDailyChallengeUser>({
    _id: {
        type: String,
        required: true,
    },
    id: {
        type: Number,
        required: true,
    },
    dataIncludesChallenges: {
        type: [Number],
        required: true,
    },
    averagePlacement: {
        type: Number,
        required: true,
    },
    averagePlacementPercent: {
        type: Number,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    played: {
        type: {
            rooms: [Number],
            count: Number,
        },
        required: true,
    },
    scoreData: {
        type: [{}],
    },
    top10Percent: {
        type: {
            rooms: [Number],
            count: Number,
        },
    },
    top50Percent: {
        type: {
            rooms: [Number],
            count: Number,
        },
    },
    username: {
        type: String,
        required: true,
    },
    streakData: {
        type: {
            currentStreak: Number,
            longestStreak: Number,
            streakHistory: [{}],
            updatedForChallenge: Number,
        },
    },
    placements: {
        type: {
            rank1: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top1: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top5: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top10: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top25: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top50: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top75: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
            top100: {
                type: {
                    rooms: [Number],
                    count: Number,
                },
                required: true,
            },
        },
        required: true,
    },
    statistics: {
        type: new Schema(
            {
                totalScore: Number,
                accuracy: Number,
                pp: Number,
                totalPP: Number,
            },
            { _id: false },
        ),
        required: true,
    },
    rankHistory: {
        type: [
            new Schema(
                {
                    date: Date,
                    rank: Number,
                },
                { _id: false },
            ),
        ],
    },
})

const dailyChallengeUserModel = (): Model<IDailyChallengeUser> => {
    return (
        mongoose.models?.DailyChallengeUser ||
        model<IDailyChallengeUser>(
            "DailyChallengeUser",
            userSchema,
            "dailychallengeprofile",
        )
    )
}

export default dailyChallengeUserModel
