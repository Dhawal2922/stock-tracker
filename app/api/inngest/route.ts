import { inngest } from "@/lib/inngest/client";
import { sendSignUpEmail } from "@/lib/inngest/functions";
import { serve } from "inngest/next";

export const {GET , PUT , POST} = serve({
    client : inngest,
    functions : [sendSignUpEmail]
})