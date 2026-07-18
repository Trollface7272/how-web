import moment from "moment-timezone"
import z from "zod"
import dailyChallengeUserModel from "../../models/daily-challenge-profile.model"
import dailyChallengeScoreModel from "../../models/daily-challenge-score.model"
import dailyChallengeModel from "../../models/daily-challenge.model"
import { lookupUser } from "../../models/session.model"
import {
    GetCurrentChallengeResponse,
    GetDailyChallengeResponse,
    GetLeaderboardsResponse,
    GetUserResponse,
    IDailyChallenge,
    RetentionData,
} from "../../types/daily-challenge"
import { procedure, router } from "../trpc"
import { DeepPick } from "ts-deep-pick"
import { IDailyChallengeScore } from "../../types/daily-challenge-score"
import { CacheTTL } from "ts-cache-mongoose"
import { FilterQuery, PipelineStage } from "mongoose"

const dailyChallengeRouter = router({
    getChartData: procedure.query(async () => {
        const minutesTo2am = moment()
            .tz("Etc/UTC")
            .endOf("day")
            .diff(moment().tz("Etc/UTC"), "minutes")
        const cacheFor = `${Math.min(minutesTo2am, 20)}m` as CacheTTL
        const [data, rawUserData] = await Promise.all([
            dailyChallengeModel()
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
                .cache(cacheFor)
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
                .cache(cacheFor)
                .exec(),
        ])

        const retentionData: RetentionData = {
            total: {},
            country: {},
        }
        rawUserData.forEach(user => {
            retentionData.total[user.played.count] ??= 0
            retentionData.total[user.played.count]++
            retentionData.country[user.country] ??= {}
            retentionData.country[user.country][user.played.count] ??= 0
            retentionData.country[user.country][user.played.count]++
        })

        return {
            dailyChallenge: data,
            retentionData,
        } as GetDailyChallengeResponse
    }),
    getDailyChallenge: procedure
        .input(
            z.object({
                date: z.string().optional(),
            }),
        )
        .query(async ({ input, ctx }) => {
            const date = new Date(input.date ?? moment().format("YYYY-MM-DD"))
            const [data] = (await dailyChallengeModel()
                .aggregate([
                    {
                        $match: {
                            starts_at: { $gt: date },
                        },
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
                        },
                    },
                ])
                .exec()) as DeepPick<
                IDailyChallenge,
                | "current_playlist_item.beatmap"
                | "current_playlist_item.required_mods"
                | "thresholds"
                | "current_playlist_item.room_id"
            >[]

            let userScore = null
            if (ctx.cookies?.session) {
                const user = await lookupUser(ctx.cookies.session)
                if (user?.osu?.userId) {
                    userScore = (await dailyChallengeScoreModel()
                        .findOne(
                            {
                                "user.id": user.osu.userId,
                                room_id: data.current_playlist_item.room_id,
                            },
                            { _id: 0, id: 1, total_score: 1, position: 1 },
                        )
                        .exec()) as DeepPick<
                        IDailyChallengeScore,
                        "id" | "total_score" | "position"
                    >
                }
            }

            return {
                currentChallenge: data.current_playlist_item,
                thresholds: data.thresholds,
                currentUserScore: userScore,
            } as GetCurrentChallengeResponse
        }),
    getLeaderboards: procedure
        .input(
            z.object({
                sort: z
                    .array(
                        z
                            .enum([
                                "rank1",
                                "top1",
                                "top5",
                                "top10",
                                "top25",
                                "top50",
                                "top75",
                                "top100",
                                "total_score",
                                "pp",
                            ])
                            .optional()
                            .transform(value => {
                                if (value === "total_score")
                                    return "statistics.totalScore"
                                if (value === "pp") return "statistics.pp"
                                return `placements.${value}.count`
                            }),
                    )
                    .default(["top100", "total_score"]),
                cursor: z.number().nullish(),
                limit: z.number().optional().default(100),
            }),
        )
        .query(async ({ input, ctx }) => {
            const sort = input.sort.reduce(
                (acc, el) => {
                    acc[el] = -1
                    return acc
                },
                {} as Record<string, 1 | -1>,
            )
            const cursor = input.cursor ?? 0
            const user = ctx.cookies.session
                ? await lookupUser(ctx.cookies.session)
                : null

            const projection = {
                _id: 0,
                username: 1,
                id: 1,
                country: 1,
                "placements.rank1.count": 1,
                "placements.top1.count": 1,
                "placements.top5.count": 1,
                "placements.top10.count": 1,
                "placements.top25.count": 1,
                "placements.top50.count": 1,
                "placements.top75.count": 1,
                "placements.top100.count": 1,
                "statistics.totalScore": 1,
                "statistics.pp": 1,
            }

            const pipeline: PipelineStage[] = [
                { $project: projection },
                { $sort: sort },
                {
                    $facet: {
                        data: [{ $skip: cursor }, { $limit: input.limit }],
                        self: user?.osu?.userId
                            ? [{ $match: { id: user.osu.userId } }]
                            : [{ $match: { id: { $exists: false } } }],
                    },
                },
            ]

            const result = await dailyChallengeUserModel()
                .aggregate(pipeline)
                .allowDiskUse(true)
                .exec()

            const { data = [], self = [] } = result[0] ?? {}

            let selfRow =
                (self?.[0] as
                    | (GetLeaderboardsResponse & { position?: number })
                    | null) ?? null

            if (selfRow) {
                const sortFields = Object.keys(sort)
                const getValue = (doc: Record<string, any>, path: string) =>
                    path.split(".").reduce((acc, key) => acc?.[key], doc)

                const higherRankFilter: FilterQuery<any> = {
                    $or: sortFields.map((field, index) => {
                        const clause: Record<string, unknown> = {}
                        for (let i = 0; i < index; i++) {
                            clause[sortFields[i]] = getValue(
                                selfRow as Record<string, any>,
                                sortFields[i],
                            )
                        }
                        // All sorts are descending: higher value ranks first
                        clause[field] = {
                            $gt: getValue(
                                selfRow as Record<string, any>,
                                field,
                            ),
                        }
                        return clause
                    }),
                }

                selfRow = {
                    ...selfRow,
                    position:
                        (await dailyChallengeUserModel()
                            .countDocuments(higherRankFilter)
                            .exec()) + 1,
                }
            }

            return {
                data: data as GetLeaderboardsResponse[],
                self: selfRow as
                    | (GetLeaderboardsResponse & { position: number })
                    | null,
                nextCursor: cursor + input.limit,
                page: Math.floor(cursor / input.limit),
                total: await dailyChallengeUserModel()
                    .countDocuments({})
                    .cache("10m")
                    .exec(),
            }
        }),
    getUser: procedure
        .input(
            z.object({
                id: z.string(),
            }),
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
                            "statistics.totalScore": 1,
                            "statistics.accuracy": 1,
                            "statistics.pp": 1,
                            "statistics.totalPP": 1,
                            "rankHistory.date": 1,
                            "rankHistory.rank": 1,
                        },
                    },
                ])
                .exec()

            const user = data[0] as GetUserResponse | undefined
            if (!user) return user

            const pp = user.statistics?.pp
            // Use native collection count — mongoose strictQuery can strip nested filters
            const ppRank =
                pp != null
                    ? (await dailyChallengeUserModel().collection.countDocuments(
                          {
                              "statistics.pp": { $gt: pp },
                          },
                      )) + 1
                    : null

            return {
                ...user,
                rankHistory: user.rankHistory ?? [],
                ppRank,
            } as GetUserResponse
        }),
    searchUser: procedure
        .input(
            z.object({
                query: z.string(),
            }),
        )
        .query(async ({ input }) => {
            const data = await dailyChallengeUserModel()
                .find(
                    { username: { $regex: input.query, $options: "i" } },
                    { username: 1, id: 1, country: 1 },
                )
                .limit(10)
                .exec()
            return data as {
                username: string
                id: number
                country: string
            }[]
        }),
    getScores: procedure
        .input(
            z.object({
                roomId: z.number().optional(),
                roomDate: z.string().optional(),
                userId: z.number().optional(),
                cursor: z.number().nullish(),
                limit: z
                    .number()
                    .optional()
                    .default(100)
                    .transform(value => Math.min(value, 100)),
                sort: z
                    .array(
                        z.enum([
                            "total_score",
                            "accuracy",
                            "rank",
                            "date",
                            "performance",
                        ]),
                    )
                    .optional()
                    .default(["performance"]),
            }),
        )
        .query(async ({ input }) => {
            if (input.roomDate) {
                input.roomId = (
                    await dailyChallengeModel()
                        .findOne(
                            { date: input.roomDate },
                            {
                                _id: 0,
                                "current_playlist_item.room_id": 1,
                            },
                        )
                        .exec()
                )?.current_playlist_item.room_id
            }
            const filter = {} as FilterQuery<IDailyChallengeScore>
            if (input.roomId) filter.room_id = input.roomId
            if (input.userId) filter["user.id"] = input.userId
            const sort = input.sort.reduce(
                (acc, el) => {
                    const field =
                        el === "date"
                            ? "ended_at"
                            : el === "performance"
                              ? "pp"
                              : el
                    acc[field] = -1
                    return acc
                },
                {} as Record<string, 1 | -1>,
            )
            const cursor = input.cursor ?? 0
            const [scores, total] = await Promise.all([
                dailyChallengeScoreModel()
                    .find(filter)
                    .sort(sort)
                    .skip(cursor)
                    .limit(input.limit)
                    .lean()
                    .exec(),
                dailyChallengeScoreModel().countDocuments(filter).exec(),
            ])

            const roomIds = [
                ...new Set(
                    scores
                        .map(score => score.room_id)
                        .filter((id): id is number => id != null),
                ),
            ]
            const beatmapIds = [
                ...new Set(
                    scores
                        .map(score => score.beatmap_id)
                        .filter((id): id is number => id != null),
                ),
            ]

            const challenges =
                roomIds.length > 0 || beatmapIds.length > 0
                    ? await dailyChallengeModel()
                          .find(
                              {
                                  $or: [
                                      ...(roomIds.length
                                          ? [
                                                {
                                                    "current_playlist_item.room_id":
                                                        { $in: roomIds },
                                                },
                                            ]
                                          : []),
                                      ...(beatmapIds.length
                                          ? [
                                                {
                                                    "current_playlist_item.beatmap_id":
                                                        { $in: beatmapIds },
                                                },
                                                {
                                                    "current_playlist_item.beatmap.id":
                                                        { $in: beatmapIds },
                                                },
                                            ]
                                          : []),
                                  ],
                              },
                              {
                                  _id: 0,
                                  "current_playlist_item.room_id": 1,
                                  "current_playlist_item.beatmap_id": 1,
                                  "current_playlist_item.beatmap": 1,
                              },
                          )
                          .lean()
                          .exec()
                    : []

            const beatmapByRoomId = new Map<number, any>()
            const beatmapByBeatmapId = new Map<number, any>()

            for (const challenge of challenges) {
                const item = challenge.current_playlist_item
                const beatmap = item?.beatmap
                if (!beatmap) continue

                if (item.room_id != null) {
                    const existing = beatmapByRoomId.get(item.room_id)
                    if (!existing?.beatmapset && beatmap.beatmapset) {
                        beatmapByRoomId.set(item.room_id, beatmap)
                    } else if (!existing) {
                        beatmapByRoomId.set(item.room_id, beatmap)
                    }
                }

                const beatmapId = item.beatmap_id ?? beatmap.id
                if (beatmapId != null) {
                    const existing = beatmapByBeatmapId.get(beatmapId)
                    if (!existing?.beatmapset && beatmap.beatmapset) {
                        beatmapByBeatmapId.set(beatmapId, beatmap)
                    } else if (!existing) {
                        beatmapByBeatmapId.set(beatmapId, beatmap)
                    }
                }
            }

            const data = scores.map(score => {
                const beatmap =
                    beatmapByRoomId.get(score.room_id) ??
                    beatmapByBeatmapId.get(score.beatmap_id) ??
                    null
                return {
                    ...score,
                    beatmap,
                }
            })

            return {
                data,
                nextCursor: cursor + input.limit,
                page: Math.floor(cursor / input.limit),
                total,
            }
        }),
})

export default dailyChallengeRouter
