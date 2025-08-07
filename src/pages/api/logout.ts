import { deleteCookie } from "cookies-next"
import { NextApiRequest, NextApiResponse } from "next"
import sessionModel from "../../models/session.model"




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader("Set-Cookie", "session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;")
    res.status(200).json({ message: "Logged out" })
}