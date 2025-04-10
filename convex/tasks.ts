import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getUsersByClerkId } from "./_utils";

export const create = mutation({args: {
    statId: v.id('users_stats'),
    task: v.string(),
    frequency: v.string(),
    value: v.number()
}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //Check that the stat exists and is linked to the user:
    const stat = await ctx.db.get(args.statId);

    if (!stat) {
        throw new ConvexError("Stat not found");
    }
    if (stat.userId !== currentUser._id) {
        throw new ConvexError("Stat not linked to user");
    }

    //Regular expression that checks that frequency has 7 characters, each either a 1 or a 0.
    const regex = /^[01]{7}$/;

    if (!regex.test(args.frequency)) {
        throw new ConvexError("Frequency isn't formatted properly")
    }
    //Create
    await ctx.db.insert('users_tasks', {
        userId: currentUser._id,
        statId: args.statId,
        task: args.task,
        frequency: args.frequency,
        value: args.value,
        timesCompleted: 0,
        completedToday: false,
    })

}});

//get task

//Get all tasks

export const getAll = query({args: {}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    const tasks = await ctx.db.query('users_tasks').withIndex("by_userId", q=>q.eq('userId', currentUser._id)).collect();

    return tasks;
}  })

//Get tasks by stat

export const getByStat = query({args: {statId: v.id('users_stats')}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //Check that the stat exists and is linked to the current user.
    const stat = await ctx.db.get(args.statId);
    if (!stat) {
        throw new ConvexError("Stat not found");
    }
    if (stat.userId !== currentUser._id) {
        throw new ConvexError("Stat not found");
    }

    //Get the tasks related to this stat
    const tasks = await ctx.db.query('users_tasks').withIndex("by_statId", q=>q.eq("statId", stat._id)).collect();

    return tasks;
}  })

//Edit task name

//Delete task

//Edit frequency

//Complete task for the day