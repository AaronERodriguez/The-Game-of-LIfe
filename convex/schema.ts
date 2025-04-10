import {defineSchema, defineTable} from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    }).index("by_email", ["email"]).index("by_clerkId", ["clerkId"]),
    users_stats: defineTable({
        userId: v.id("users"),
        name: v.string(),
        value: v.number(),
        decay: v.boolean(),
        color: v.string()
    }).index("by_userId", ['userId']),
    users_tasks: defineTable({
        userId: v.id("users"),
        statId: v.id('users_stats'),
        task: v.string(),
        frequency: v.string(),
        timesCompleted: v.number(),
        value: v.number(),
        completedToday: v.boolean()
    }).index('by_userId', ['userId']).index('by_statId', ['statId'])
})