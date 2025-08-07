import { NextApiRequest, NextApiResponse } from "next";
import userModel from "../../../models/user.model";
import { randomBytes } from "crypto";
import sessionModel from "../../../models/session.model";


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { code, state } = req.query
    if (!code) return res.status(400).json({ error: "No code provided" })
    const response = await fetch(`https://osu.ppy.sh/oauth/token`, {
        method: "POST",
        body: JSON.stringify({
            client_id: process.env.OSU_CLIENT_ID,
            client_secret: process.env.OSU_CLIENT_SECRET,
            code: code,
            grant_type: "authorization_code",
            redirect_uri: process.env.OSU_RETURN_URL
        }),
        headers: {
            "Content-Type": "application/json"
        }
    })
    const data: {
        token_type: "Bearer",
        access_token: string,
        expires_in: number,
        refresh_token: string,
        scope: string
    } = await response.json()

    const osuUserRequest = await fetch(`https://osu.ppy.sh/api/v2/me`, {
        headers: {
            "Authorization": `Bearer ${data.access_token}`
        }
    })

    const osuUser = await osuUserRequest.json()

    const user = (await userModel()
        .findOne(state ? { osuTemp: state } : { "osu.userId": osuUser.id })
        .exec())!

    user.osu = {
        token: data.access_token,
        tokenType: data.token_type,
        expiresIn: new Date(Date.now() + data.expires_in * 900),
        refreshToken: data.refresh_token,
        scopes: ["public", "identify", "friends.read"],
        username: osuUser.username,
        userId: osuUser.id,
        country: osuUser.country_code,
        countryRank: osuUser.statistics.country_rank,
        pp: osuUser.statistics.pp,
        rank: osuUser.statistics.global_rank
    }

    if (process.env.NODE_ENV === "production") {
        await user.save()
    }

    const session_token = randomBytes(32).toString("hex")
    const ip = (req.headers["x-forwarded-for"] as string | undefined) ?? req.socket.remoteAddress
    const session = await sessionModel()
        .create({
            userId: user.id,
            token: session_token,
            ip: ip,
            userAgent: req.headers["user-agent"] as string
        })

    res
        .setHeader("Set-Cookie", `session=${session_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`)
        .status(200)
        .redirect("/")
}