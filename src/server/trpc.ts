import { TRPCError, initTRPC } from "@trpc/server"
import type { NextApiRequestCookies } from "next/dist/server/api-utils"
// Avoid exporting the entire t-object
// since it's not very descriptive.
// For instance, the use of a t variable
// is common in i18n libraries.
const t = initTRPC
    .context<{
        cookies: NextApiRequestCookies
    }>()
    .create()
// Base router and procedure helpers
export const router = t.router
export const procedure = t.procedure
