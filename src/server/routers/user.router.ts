import { z } from "zod";
import userModel, { IClientUser } from "../../models/user.model";
import { procedure, router } from "../trpc";
import sessionModel, { lookupUser } from "../../models/session.model";

const userRouter = router({
    hello: procedure
        .input(
            z.object({
                text: z.string(),
            })
        )
        .query(({ input }) => {
            return {
                greeting: `hello ${input.text}`,
            };
        }),
    getUser: procedure.query(async () => {
        const users = await userModel().aggregate([
            {
                $project: {
                    id: 1,
                    username: 1,
                },
            },
        ]);
        return users;
    }),
    getLoggedUser: procedure.query(async ({ ctx }) => {
        const cookie = ctx.cookies.session
        if (!cookie) return null

        const user = await lookupUser(cookie)

        if (!user) return null

        return user as IClientUser
    })
});

export default userRouter;
