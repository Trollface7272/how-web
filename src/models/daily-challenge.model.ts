import mongoose, { Model, model, Schema } from "mongoose";
import { IDailyChallenge } from "../types/daily-challenge";


const userSchema = new Schema<IDailyChallenge>({
    active: {
        type: Boolean,
        default: false,
    },
    auto_skip: {
        type: Boolean,
        default: false,
    },
    category: {
        type: String,
        default: "osu",
    },
    channel_id: {
        type: Number,
        required: true,
    },
    current_playlist_item: {
        id: { type: Number, required: true },
        room_id: { type: Number, required: true },
        beatmap_id: { type: Number, required: true },
        ruleset_id: { type: Number, required: true },
        allowed_mods: { type: Schema.Types.Mixed, default: [] },
        required_mods: { type: Schema.Types.Mixed, default: [] },
        expired: { type: Boolean, default: false },
        owner_id: { type: Number, required: true },
        playlist_order: { type: Schema.Types.Mixed, default: null },
        played_at: { type: Date, default: null },
        beatmap: {
            beatmapset_id: { type: Number, required: true },
            difficulty_rating: { type: Number, required: true },
            id: { type: Number, required: true },
            mode: { type: String, required: true },
            status: { type: String, required: true },
            total_length: { type: Number, required: true },
            user_id: { type: Number, required: true },
            version: { type: String, required: true },
            accuracy: { type: Number, default: 0.0 },
            ar: { type: Number, default: 0.0 },
            bpm: { type: Number, default: 0.0 },
            convert: { type: Boolean, default: false },
            count_circles: { type: Number, default: null },
        }
    },
    difficulty_range: {
        type: {
            min: { type: Number, required: true },
            max: { type: Number, required: true },
        },
        required: true,
    },
    ends_at: {
        type: Date,
        required: true,
    },
    fetchedScores: {
        type: Boolean,
        default: false,
    },
    has_password: {
        type: Boolean,
        default: false,
    },
    host: {
        type: {
            id: { type: Number, required: true },
            username: { type: String, required: true },
        },
        required: true,
    },
    id: {
        type: Number,
        required: true,
        unique: true,
    },
    index: {
        type: Number,
        required: true,
    },
    max_attempts: {
        type: Schema.Types.Mixed,
        default: null,
    },
    name: {
        type: String,
        required: true,
    },
    participant_count: {
        type: Number,
        default: 0,
    },
    playlist_item_stats: {
        type: {
            count_active: Number,
            count_total: Number,
            ruleset_ids: [Number]
        },
        default: {},
    },
    queue_mode: {
        type: String,
        default: "normal",
    },
    recent_participants: [{
        id: { type: Number, required: true },
        username: { type: String, required: true },
        score: { type: Number, default: 0 },
        rank: { type: String, default: "X" },
    }],
    starts_at: {
        type: Date,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    user_id: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        default: 0,
    },
    lastUpdated: {
        type: Date,
        default: Date.now,
    },
    thresholds: {
        type: [{
            date: { type: Date, required: true },
            top10: {
                position: { type: Number, required: true },
                score: { type: Number, required: true },
            },
            top50: {
                position: { type: Number, required: true },
                score: { type: Number, required: true },
            },
            rank1: {
                position: { type: Number, required: true },
                score: { type: Number, required: true },
            },
            total: { type: Number, required: true },
        }],
        default: [],
    },
    modData: {
        type: {
            single: {
                type: Schema.Types.Mixed,
            },
            combinations: {
                type: Schema.Types.Mixed,
            }
        },
        default: {
            single: {},
            combinations: {},
        },
    }
});

const dailyChallengeModel = (): Model<IDailyChallenge> => {
    return mongoose.models?.DailyChallenge || model<IDailyChallenge>("DailyChallenge", userSchema, "dailychallenge")
};

export default dailyChallengeModel;
