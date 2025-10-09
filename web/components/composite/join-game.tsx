"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-label"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { JoinGameFormData, joinGameSchema } from "@/schemas/lobby.schema"


export function JoinGame() {
    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
    } = useForm<JoinGameFormData>({
        resolver: zodResolver(joinGameSchema),
        defaultValues: {
            name: "",
            groupId: "",
        },
    })

    const onSubmit = async (data: JoinGameFormData) => {
        console.log("✅ Joining Game:", data)
        // Example: await fetch("/api/join", { method: "POST", body: JSON.stringify(data) })
        reset()
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Join Game</CardTitle>
                    <CardDescription>
                        Enter the game details below to join an existing game.
                    </CardDescription>
                </CardHeader>

                <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="John Doe"
                            {...register("name")}
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="grid gap-3">
                        <Label htmlFor="groupId">Group ID</Label>
                        <Input
                            id="groupId"
                            type="text"
                            placeholder="e.g. ABC123"
                            {...register("groupId")}
                            disabled={isSubmitting}
                        />
                        {errors.groupId && (
                            <p className="text-sm text-red-500">{errors.groupId.message}</p>
                        )}
                    </div>
                </CardContent>

                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Joining..." : "Join Game"}
                    </Button>
                </CardFooter>
            </Card >
        </form>
    )
}
