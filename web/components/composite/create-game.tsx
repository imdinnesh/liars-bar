"use client"

import { Label } from "@radix-ui/react-label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { cn } from "@/lib/utils"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { type CreateGameForm, createGameSchema } from "@/schemas/lobby.schema"
import { useWebSocket } from "@/hooks/webSocket"
import { type GroupCreatedPayload, LobbyEvent, ServerEvent } from "@/lib/lobby.types"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export function CreateGame() {
  const [groupId, setGroupId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const { messages, sendMessage, isConnected } = useWebSocket("ws://localhost:8080")

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateGameForm>({
    resolver: zodResolver(createGameSchema),
    defaultValues: {
      name: "",
    },
  })

  const onSubmit = async (data: CreateGameForm) => {
    if (!isConnected) return
    sendMessage({
      type: LobbyEvent.CREATE_GROUP,
      payload: {
        ownerName: data.name,
      },
    })
  }

  useEffect(() => {
    if (messages.length === 0) return
    const lastMessage = messages[messages.length - 1]

    switch (lastMessage.type) {
      case ServerEvent.GROUP_CREATED:
        const payload = lastMessage.payload as GroupCreatedPayload
        setGroupId(payload.groupId)
        toast.success("Game created! Share the Group ID with friends.")
        break
    }
  }, [messages, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-busy={isSubmitting}>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Create Game</CardTitle>
          <div className="flex items-center justify-between">
            <CardDescription>
              Type in your details below to create a new game. Share the Group ID with friends.
            </CardDescription>
            <div className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
              <span
                className={cn("h-2 w-2 rounded-full", isConnected ? "bg-primary" : "bg-muted-foreground/40")}
                aria-hidden
              />
              <span>{isConnected ? "Connected" : "Connecting..."}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? "name-error" : "name-help"}
              {...register("name")}
              disabled={isSubmitting}
            />
            {!errors.name ? (
              <p id="name-help" className="text-xs text-muted-foreground">
                This name will be visible to other players.
              </p>
            ) : null}
            {errors.name && (
              <p id="name-error" role="alert" className="text-sm text-destructive-foreground">
                {errors.name.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-stretch gap-3">
          <Button type="submit" disabled={isSubmitting || !isConnected} className="w-full">
            {isSubmitting ? "Creating..." : "Create Game"}
          </Button>

          {groupId ? (
            <div className="flex items-center gap-2">
              <code
                className="px-2 py-1 rounded-md bg-muted text-sm text-foreground truncate"
                aria-live="polite"
                title={groupId}
              >
                {groupId}
              </code>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(groupId)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  } catch {}
                }}
                aria-label="Copy Group ID"
              >
                {copied ? "Copied!" : "Copy Group ID"}
              </Button>
            </div>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  )
}
