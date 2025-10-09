import { z } from "zod";

export const createGameSchema = z.object({
    name: z
        .string()
        .min(2, { message: "Name must be at least 2 characters long" })
        .max(30, { message: "Name must be at most 30 characters long" }),
})

export type CreateGameForm = z.infer<typeof createGameSchema>

export const joinGameSchema = z.object({
    groupId: z.string().min(1, "Group ID is required"),
    name: z.string().min(1, "Name is required"),
})

export type JoinGameFormData = z.infer<typeof joinGameSchema>;