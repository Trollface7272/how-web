import moment from "moment-timezone";
import z from "zod";
import dailyChallengeUserModel from "../../models/daily-challenge-profile.model";
import dailyChallengeScoreModel from "../../models/daily-challenge-score.model";
import dailyChallengeModel from "../../models/daily-challenge.model";
import { lookupUser } from "../../models/session.model";
import {
    GetCurrentChallengeResponse,
    GetDailyChallengeResponse,
    GetLeaderboardsResponse,
    GetUserResponse,
    IDailyChallenge,
    RetentionData,
} from "../../types/daily-challenge";
import { procedure, router } from "../trpc";
import { DeepPick } from "ts-deep-pick";
import { IDailyChallengeScore } from "../../types/daily-challenge-score";

const dailyChallengeRouter = router({
    getChartData: procedure.query(async () => {
        const minutesTo2am = moment().tz("Etc/UTC").endOf("day").diff(moment().tz("Etc/UTC"), "minutes")
        const [data, rawUserData] = await Promise.all([dailyChallengeModel()
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        total: 1,
                        starts_at: 1,
                        ends_at: 1,
                        thresholds: { $arrayElemAt: ["$thresholds", -1] },
                        "current_playlist_item.required_mods": 1,
                        "current_playlist_item.room_id": 1,
                        modData: 1,
                    },
                },
            ])
            .cache(`${minutesTo2am}m`)
            .exec(),
        dailyChallengeUserModel()
            .aggregate([
                {
                    $project: {
                        _id: 0,
                        "played.count": 1,
                        country: 1,
                    },
                },
            ])
            .cache(`${minutesTo2am}m`)
            .exec()
        ])

        const retentionData: RetentionData = {
            total: {},
            country: {},
        };
        rawUserData.forEach((user) => {
            retentionData.total[user.played.count] ??= 0;
            retentionData.total[user.played.count]++;
            retentionData.country[user.country] ??= {};
            retentionData.country[user.country][user.played.count] ??= 0;
            retentionData.country[user.country][user.played.count]++;
        });

        return {
            dailyChallenge: data,
            retentionData,
        } as GetDailyChallengeResponse;
    }),
    getDailyChallenge: procedure
        .input(
            z.object({
                date: z
                    .string()
                    .optional()
            })
        )
        .query(async ({ input, ctx }) => {
            const date = new Date(input.date ?? moment().format("YYYY-MM-DD"))
            const [data] = (await dailyChallengeModel()
                .aggregate([{
                    $match: {
                        starts_at: { $gt: date },
                    }
                },
                {
                    $limit: 1,
                },
                {
                    $project: {
                        _id: 0,
                        "current_playlist_item.beatmap": 1,
                        "current_playlist_item.required_mods": 1,
                        thresholds: 1,
                        "current_playlist_item.room_id": 1,
                    }
                }
                ])
                .exec()) as DeepPick<
                    IDailyChallenge,
                    | "current_playlist_item.beatmap"
                    | "current_playlist_item.required_mods"
                    | "thresholds"
                    | "current_playlist_item.room_id"
                >[];

            let userScore = null;
            if (ctx.cookies?.session) {
                const user = await lookupUser(ctx.cookies.session);
                if (user?.osu?.userId) {
                    userScore = (await dailyChallengeScoreModel()
                        .findOne(
                            {
                                "user.id": user.osu.userId,
                                room_id: data.current_playlist_item.room_id,
                            },
                            { _id: 0, id: 1, total_score: 1, position: 1 }
                        )
                        .exec()) as DeepPick<
                            IDailyChallengeScore,
                            "id" | "total_score" | "position"
                        >;
                }
            }

            return {
                currentChallenge: data.current_playlist_item,
                thresholds: data.thresholds,
                currentUserScore: userScore,
            } as GetCurrentChallengeResponse;
        }),
    getLeaderboards: procedure
        .input(
            z.object({
                sort: z
                    .enum(["top10Percent", "top50Percent", "played"])
                    .optional()
                    .default("played")
                    .transform((value) => {
                        return `${value}.count`;
                    }),
                cursor: z.number().nullish(),
                limit: z.number().optional().default(100),
            })
        )
        .query(async ({ input }) => {
            const cursor = input.cursor ?? 0;
            const data = await dailyChallengeUserModel()
                .aggregate([
                    {
                        $sort: {
                            [input.sort]: -1,
                            "top10Percent.count": -1,
                        },
                    },
                    {
                        $skip: cursor,
                    },
                    {
                        $limit: input.limit,
                    },
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            id: 1,
                            country: 1,
                            "played.count": 1,
                            "top10Percent.count": 1,
                            "top50Percent.count": 1,
                        },
                    },
                ])
                .cache("10m")
                .exec();

            return {
                data: data as GetLeaderboardsResponse[],
                nextCursor: cursor + input.limit,
                page: Math.floor(cursor / input.limit),
                total: await dailyChallengeUserModel()
                    .countDocuments({})
                    .cache("10m")
                    .exec(),
            };
        }),
    getUser: procedure
        .input(
            z.object({
                id: z.string(),
            })
        )
        .query(async ({ input }) => {
            const data = await dailyChallengeUserModel()
                .aggregate([
                    {
                        $match: {
                            id: parseInt(input.id),
                        },
                    },
                    {
                        $project: {
                            _id: 0,
                            username: 1,
                            id: 1,
                            country: 1,
                            "played.count": 1,
                            "top10Percent.count": 1,
                            "top50Percent.count": 1,
                            "scoreData.room_id": 1,
                            "scoreData.score_id": 1,
                            "scoreData.score": 1,
                            "scoreData.accuracy": 1,
                            "scoreData.rank": 1,
                            "scoreData.date": 1,
                            "scoreData.position": 1,
                            "scoreData.positionPercent": 1,
                            averagePlacement: 1,
                            averagePlacementPercent: 1,
                        },
                    },
                ])
                .exec();
            return data[0] as GetUserResponse;
        }),
    searchUser: procedure
        .input(
            z.object({
                query: z.string(),
            })
        )
        .query(async ({ input }) => {
            const data = await dailyChallengeUserModel()
                .find(
                    { username: { $regex: input.query, $options: "i" } },
                    { username: 1, id: 1, country: 1 }
                )
                .limit(10)
                .exec();
            return data as {
                username: string;
                id: number;
                country: string;
            }[];
        }),
});

export default dailyChallengeRouter;
