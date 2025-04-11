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

export const editName = mutation({args: {taskId: v.id('users_tasks'), name: v.string()}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
        throw new ConvexError("Task not found");
    }
    if (task.userId !== currentUser._id) {
        throw new ConvexError("Task not found");
    }

    //change the name
    await ctx.db.patch(task._id, {
        task: args.name
    })
}})

//Delete task
export const deleteTask = mutation({args: {taskId: v.id('users_tasks')}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //check that the user is the owner of the task
    const task = await ctx.db.get(args.taskId);

    if (!task) {
        throw new ConvexError("Task not found");
    }
    if (task.userId !== currentUser._id) {
        throw new ConvexError("Task not linked to user");
    }

    //Delete the task:
    await ctx.db.delete(task._id);

}})
//Edit frequency
export const editFrequency = mutation({args: {taskId: v.id('users_tasks'), frequency: v.string()}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    const task = await ctx.db.get(args.taskId);
    if (!task) {
        throw new ConvexError("Task not found");
    }
    if (task.userId !== currentUser._id) {
        throw new ConvexError("Task not found");
    }

    //Regular expression that checks that frequency has 7 characters, each either a 1 or a 0.
    const regex = /^[01]{7}$/;

    if (!regex.test(args.frequency)) {
        throw new ConvexError("Frequency isn't formatted properly")
    }

    await ctx.db.patch(task._id, {
        frequency: args.frequency
    })
}})

//Complete task for the day

export const complete = mutation({args: {taskId: v.id('users_tasks')}, handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
        
    if(!identity) {
        throw new Error("Unauthorized")
    }
    
    const currentUser = await getUsersByClerkId({ctx, clerkId: identity.subject});
    
    
    if (!currentUser) {
        throw new ConvexError("User not found")
    }

    //Check that the tasks exists and is linked to the user:
    const task = await ctx.db.get(args.taskId);
    if (!task) {
        throw new ConvexError("Task not found");
    }
    if (task.userId !== currentUser._id) {
        throw new ConvexError("Task not found");
    }

    //Check that the task hasn't been completed today
    if (task.completedToday) {
        throw new ConvexError("Task already completed today");
    };

    //get the stat related to this stat
    const stat = await ctx.db.get(task.statId);

    if (!stat) {
        throw new ConvexError("Stat not found");
    }

    //Mark the task as completed and add values to the corresponding stat.
    await ctx.db.patch(task._id, {
        completedToday: true,
    })

    await ctx.db.patch(stat._id, {
        value: stat.value + task.value
    })
}})