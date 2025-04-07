import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUsersByClerkId } from "./_utils";

export const createStat = mutation({args: {
    name: v.string(),
    decay: v.boolean(),
    color: v.string(),
}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    return await ctx.db.insert('users_stats', {
        userId: currentUser._id,
        name: args.name,
        decay: args.decay,
        color: args.color,
        value: 0
    })

}})

//Get Stats by User

export const getStats = query({args: {}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    const stats = await ctx.db.query('users_stats').withIndex("by_userId", q=>q.eq('userId', currentUser._id)).collect();

    return stats;
}  })

//Edit Stat Color

//Delete Stat