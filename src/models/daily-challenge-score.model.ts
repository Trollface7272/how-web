import mongoose, { model, Model, Schema } from "mongoose"
import { IDailyChallengeScore } from "../types/daily-challenge-score"

const scoreSchema = new Schema<IDailyChallengeScore>({
    id: {
        type: Number,
        required: true,
    },
    room_id: {
        type: Number,
    },
    user: {
        type: Object,
        required: true,
    },
    accuracy: {
        type: Number,
    },
    beatmap_id: {
        type: Number,
    },
    best_id: {
        type: Number,
    },
    build_id: {
        type: Number,
    },
    classic_total_score: {
        type: Number,
    },
    current_user_attributes: {
        type: Object,
        required: true,
    },
    ended_at: {
        type: String,
    },
    has_replay: {
        type: Boolean,
    },
    index: {
        type: Number,
    },
    is_perfect_combo: {
        type: Boolean,
    },
    legacy_perfect: {
        type: Boolean,
    },
    legacy_score_id: {
        type: Number,
    },
    legacy_total_score: {
        type: Number,
    },
    match: {
        type: Object,
    },
    max_combo: {
        type: Number,
    },
    maximum_statistics: {
        type: Object,
    },
    mods: {
        type: [Object],
    },
    passed: {
        type: Boolean,
    },
    playlist_item_id: {
        type: Number,
    },
    position: {
        type: Number,
    },
    pp: {
        type: Number,
    },
    preserve: {
        type: Boolean,
    },
    processed: {
        type: Boolean,
    },
    rank: {
        type: String,
    },
    ranked: {
        type: Boolean,
    },
    replay: {
        type: Boolean,
    },
    ruleset_id: {
        type: Number,
    },
    scores_around: {
        type: Object,
    },
    solo_score_id: {
        type: Number,
    },
    started_at: {
        type: String,
    },
    statistics: {
        type: Object,
    },
    temporary: {
        type: Boolean,
    },
    total_score: {
        type: Number,
    },
    total_score_without_mods: {
        type: Number,
    },
    type: {
        type: String,
    },
    user_id: {
        type: Number,
    },
})

const dailyChallengeScoreModel = (): Model<IDailyChallengeScore> => {
    return (
        mongoose.models?.DailyChallengeScore ||
        model<IDailyChallengeScore>(
            "DailyChallengeScore",
            scoreSchema,
            "dailychallengescore",
        )
    )
}

export default dailyChallengeScoreModel
