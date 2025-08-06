import mongoose, { model, Model, Schema } from "mongoose"


interface ISession {
    userId: string
    token: string
    ip: string
    userAgent: string
    createdAt: Date
}

const sessionSchema = new Schema<ISession>({
    userId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    ip: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const sessionModel = (): Model<ISession> => {
    return mongoose.models?.Session || model<ISession>("Session", sessionSchema, "sessions")
}

export default sessionModel