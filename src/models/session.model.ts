import mongoose, { model, Model, Schema } from "mongoose"
import userModel, { IClientUser } from "./user.model"
import NodeCache from "node-cache"

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

const sessionCache = new NodeCache({
    stdTTL: 60,
})

export const lookupUser = async (sessionCookie: string) => {
    if (sessionCache.has(sessionCookie)) {
        return sessionCache.get<IClientUser>(sessionCookie)
    }

    const session = await sessionModel()
        .findOne({ token: sessionCookie })
        .exec()

    if (!session) return null

    const user = await userModel()
        .findOne({ id: session.userId }, { _id: 0, id: 1, username: 1, "osu.username": 1, "osu.userId": 1 })
        .exec()

    if (!user) return null

    sessionCache.set(sessionCookie, {
        id: user.id,
        username: user.username,
        osu: {
            username: user.osu?.username,
            userId: user.osu?.userId
        }
    })

    return user as IClientUser
}

export default sessionModel