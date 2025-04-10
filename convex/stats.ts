import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUsersByClerkId } from "./_utils";

export const create = mutation({args: {
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

export const get = query({args: {}, handler: async (ctx, args) => {
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
export const edit = mutation({args: {statId: v.id('users_stats'), color: v.string()}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //Get the stat

    const stat = await ctx.db.get(args.statId);

    //check that it exists
    if (!stat) {
        throw new ConvexError("Stat not found");
    }

    //check that the user is connected to that stat
    if (stat.userId !== currentUser._id) {
        throw new ConvexError("You are not connected to this stat");
    }

    //Edit the stat to the corresponding color
    await ctx.db.patch(stat._id, {
        color: args.color
    });
}})

//Delete Stat
export const deleteStat = mutation({args: {statId: v.id('users_stats')}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //Get the stat

    const stat = await ctx.db.get(args.statId);

    //check that it exists
    if (!stat) {
        throw new ConvexError("Stat not found");
    }

    //check that the user is connected to that stat
    if (stat.userId !== currentUser._id) {
        throw new ConvexError("You are not connected to this stat");
    }

    //Get all the tasks, if existant, of that stat
    const tasks = await ctx.db.query('users_tasks').withIndex('by_statId', q=>q.eq('statId', stat._id)).collect();

    //Delete the stat and all tasks related to the stat:
    await Promise.all(tasks.map(async task => await ctx.db.delete(task._id)));

    await ctx.db.delete(stat._id);
}})