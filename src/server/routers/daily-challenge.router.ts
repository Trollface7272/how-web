import moment from "moment";
import z from "zod";
import dailyChallengeUserModel from "../../models/daily-challenge-profile.model";
import dailyChallengeModel from "../../models/daily-challenge.model";
import { GetCurrentChallengeResponse, GetDailyChallengeResponse, GetLeaderboardsResponse, GetUserResponse } from "../../types/daily-challenge";
import { procedure, router } from "../trpc";

const dailyChallengeRouter = router({
    getChartData: procedure.query(async () => {
        const data = await dailyChallengeModel()
            .aggregate([{
                $project: {
                    _id: 0, total: 1, starts_at: 1, ends_at: 1,
                    thresholds: { $arrayElemAt: ["$thresholds", -1] },
                    "current_playlist_item.required_mods": 1,
                    "current_playlist_item.room_id": 1,
                    modData: 1,
                }
            }])
            .exec()
        const userData = await dailyChallengeUserModel()
            .aggregate([{
                $project: {
                    _id: 0, top10Percent: 1, top50Percent: 1, country: 1, played: 1
                }
            }])
            .exec()

        return {
            dailyChallenge: data,
            dailyChallengeUser: userData
        } as GetDailyChallengeResponse
    }),
    getDailyChallenge: procedure
        .input(z.object({
            date: z.string().optional().default(moment().format("YYYY-MM-DD")),
        }))
        .query(async ({ input }) => {
            const data = await dailyChallengeModel()
                .aggregate([{
                    $match: {
                        starts_at: { $gt: new Date(input.date) }
                    }
                }, {
                    $limit: 1
                }, {
                    $project: {
                        _id: 0, "current_playlist_item.beatmap": 1, "current_playlist_item.required_mods": 1, "thresholds": 1
                    }
                }])
                .exec()
            return {
                currentChallenge: data[0].current_playlist_item,
                thresholds: data[0].thresholds
            } as GetCurrentChallengeResponse
        }),
    getLeaderboards: procedure
        .input(z.object({
            sort: z.enum(["top10Percent", "top50Percent", "played"]).optional().default("played").transform(
                (value) => {
                    return `${value}.count`
                }
            ),
            cursor: z.number().nullish(),
            limit: z.number().optional().default(100)
        }))
        .query(async ({ input }) => {
            const cursor = input.cursor ?? 0
            console.log(input.cursor, input.limit)
            const data = await dailyChallengeUserModel()
                .aggregate([{
                    $sort: {
                        [input.sort]: -1,
                        "top10Percent.count": -1,
                    }
                }, {
                    $skip: cursor
                }, {
                    $limit: input.limit
                }, {
                    $project: {
                        _id: 0, username: 1, id: 1, country: 1, 
                        "played.count": 1, "top10Percent.count": 1, "top50Percent.count": 1
                    }
                }])
                .exec()
                
            return {
                data: data as GetLeaderboardsResponse[],
                nextCursor: cursor + input.limit,
                page: Math.floor(cursor / input.limit),
                total: await dailyChallengeUserModel().count({}).cache("10m").exec()
            }
        }),
    getUser: procedure
        .input(z.object({
            id: z.string(),
        }))
        .query(async ({ input }) => {
            const data = await dailyChallengeUserModel()
                .aggregate([{
                    $match: {
                        id: parseInt(input.id)
                    }
                }, {
                    $project: {
                        _id: 0, username: 1, id: 1, country: 1,
                        "played.count": 1,
                        "top10Percent.count": 1, "top50Percent.count": 1,
                        "scoreData.room_id": 1, "scoreData.score_id": 1,
                        "scoreData.score": 1, "scoreData.accuracy": 1,
                        "scoreData.rank": 1, "scoreData.date": 1,
                        "scoreData.position": 1, "scoreData.positionPercent": 1,
                        averagePlacement: 1, averagePlacementPercent: 1
                    }
                }])
                .exec()
            return data[0] as GetUserResponse
        }),
    searchUser: procedure
        .input(z.object({
            query: z.string(),
        }))
        .query(async ({ input }) => {
            const data = await dailyChallengeUserModel().find({ username: { $regex: input.query, $options: "i" } }, { username: 1, id: 1, country: 1 }).limit(10).exec()
            return data as {
                username: string,
                id: number,
                country: string
            }[]
        })
});

export default dailyChallengeRouter;
