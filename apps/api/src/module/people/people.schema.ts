import { UserSummarySchema } from "@workspace/types"
import z from "zod"

export const membersResponseSchema = z.array(UserSummarySchema)
