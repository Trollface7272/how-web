import mongoose, { Model, model, Schema } from "mongoose";
import { IDailyChallengeUser } from "../types/daily-challenge-profile";


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
    }
});

const dailyChallengeUserModel = (): Model<IDailyChallengeUser> => {
  return mongoose.models?.DailyChallengeUser || model<IDailyChallengeUser>("DailyChallengeUser", userSchema, "dailychallengeprofile")
};

export default dailyChallengeUserModel;
