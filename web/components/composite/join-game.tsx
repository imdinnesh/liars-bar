"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Label } from "@radix-ui/react-label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { type JoinGameFormData, joinGameSchema } from "@/schemas/lobby.schema"
import { useWebSocket } from "@/hooks/webSocket"
import { type JoinedPayload, LobbyEvent, ServerEvent } from "@/lib/lobby.types"
import { useEffect } from "react"
import { useState } from "react"


export function JoinGame() {
    const { messages, sendMessage, isConnected } = useWebSocket("ws://localhost:8080")
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

    const [isCopied, setIsCopied] = useState(false)
    const [copied, setCopied] = useState(false)

    const onSubmit = async (data: JoinGameFormData) => {
        if (!isConnected) {
            return
        }
        sendMessage({
            type: LobbyEvent.JOIN_GROUP,
            payload: {
                name: data.name,
                groupId: data.groupId,
            },
        })
    }

    useEffect(() => {
        if (messages.length === 0) return
        const lastMessage = messages[messages.length - 1]

        switch (lastMessage.type) {
            case ServerEvent.JOINED:
                const payload = lastMessage.payload as JoinedPayload

                break
        }
    }, [messages, reset])

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Join Game</CardTitle>
                    <CardDescription>Enter the game details below to join an existing game.</CardDescription>
                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
                        <span
                            aria-hidden
                            className={`h-2 w-2 rounded-full ${isConnected ? "bg-primary" : "bg-muted-foreground/40"}`}
                        />
                        <span>{isConnected ? "Connected to server" : "Disconnected from server"}</span>
                    </div>
                </CardHeader>

                <CardContent className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" type="text" placeholder="John Doe" {...register("name")} disabled={isSubmitting} />
                        <p className="text-sm text-muted-foreground">This is how other players will see you.</p>
                        {errors.name && (
                            <p className="text-sm text-destructive" role="alert" aria-live="polite">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="groupId">Group ID</Label>
                        <div className="flex items-center gap-2">
                            <Input
                                id="groupId"
                                type="text"
                                placeholder="e.g. ABC123"
                                {...register("groupId")}
                                disabled={isSubmitting}
                                className="flex-1"
                            />
                            <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={async () => {
                                    const value = (document.getElementById("groupId") as HTMLInputElement | null)?.value?.trim()
                                    if (!value) {
                                        return
                                    }
                                    try {
                                        await navigator.clipboard.writeText(value)
                                        setCopied(true)
                                        setTimeout(() => setCopied(false), 1200)
                                    } catch (err) {
                                        console.log(err);
                                    }
                                }}
                                aria-live="polite"
                                aria-label="Copy Group ID"
                            >
                                {copied ? "Copied!" : "Copy"}
                            </Button>
                        </div>
                        <p className="text-sm text-muted-foreground">Ask your host for the Group ID, then paste it here.</p>
                        {errors.groupId && (
                            <p className="text-sm text-destructive" role="alert" aria-live="polite">
                                {errors.groupId.message}
                            </p>
                        )}
                    </div>
                </CardContent>

                <CardFooter>
                    <Button type="submit" disabled={isSubmitting || !isConnected}>
                        {isSubmitting ? "Joining..." : "Join Game"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
