import main from "../../clients/mongoose"
import { router } from "../trpc"
import dailyChallengeRouter from "./daily-challenge.router"
import userRouter from "./user.router"
export const appRouter = router({
    user: userRouter,
    dailyChallenge: dailyChallengeRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
