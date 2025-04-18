import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.daily(
    'Daily Decay of Stats',{
        hourUTC: 6,
        minuteUTC: 0
    },
    internal.stats.decay
)

export default crons;