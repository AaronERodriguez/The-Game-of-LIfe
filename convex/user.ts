import { ConvexError, v } from "convex/values"
import {internalMutation, internalQuery, mutation, query, QueryCtx} from "./_generated/server"
import { getUsersByClerkId } from "./_utils";

export const create = internalMutation({
    args: {
        username: v.string(),
        imageUrl: v.string(),
        clerkId: v.string(),
        email: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.insert("users", {...args});
    },
})

export const get = internalQuery({
    args: {clerkId: v.string()},
    async handler(ctx, args) {
        return ctx.db.query("users").withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId)).unique();
    }
})


export const deleteFromClerk = internalMutation({
    args: { clerkUserId: v.string() },
    async handler(ctx, { clerkUserId }) {
        const user = await userByExternalId(ctx, clerkUserId)
        
        if (user !== null) {
            await ctx.db.delete(user._id);
        } else {
            console.warn(
                `Can't delete user, there is none for Clerk user ID: ${clerkUserId}`,
            );
        }
    },
});

async function userByExternalId(ctx: QueryCtx, externalId: string) {
    return await ctx.db
    .query("users")
    .withIndex("by_clerkId", (q) => q.eq("clerkId", externalId))
    .unique();
}

export const getUser = query({args: {}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //obtain the stats related to this user:
    const stats = await ctx.db.query('users_stats').withIndex('by_userId', q=>q.eq("userId", currentUser._id)).collect();
    
    return {...currentUser, stats}
}})

export const getOtherUser = query({args: {
    userId: v.id('users'),
}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    const targetUser = await ctx.db.query('users').withIndex("by_id", q => q.eq("_id", args.userId)).unique();

    if (!targetUser) {
        throw new ConvexError("User not found")
    }

    return targetUser
}})

export const getAll = query({args: {}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    const users = await ctx.db.query("users").collect();

    return users;
}})