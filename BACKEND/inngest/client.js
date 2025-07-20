import { Inngest } from "inngest";

export const inngest = new Inngest({
    id : "ticketing-system",
    signingKey: process.env.INGGEST_SIGNING_KEY
});