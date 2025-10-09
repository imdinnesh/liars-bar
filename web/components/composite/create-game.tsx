"use client"

import { Label } from "@radix-ui/react-label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CreateGameForm, createGameSchema } from "@/schemas/lobby.schema"

export function CreateGame() {

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
        console.log("✅ Game Created:", data)
        reset()
    }


    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <Card>
                <CardHeader>
                    <CardTitle>Create Game</CardTitle>
                    <CardDescription>
                        Type in your details below to create a new game
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                    <div className="grid gap-3">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            placeholder="John Doe"
                            {...register("name")}
                            disabled={isSubmitting}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500">{errors.name.message}</p>
                        )}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Game"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}