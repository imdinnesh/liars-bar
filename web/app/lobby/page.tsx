import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs"
import { JoinGame } from "@/components/composite/join-game"
import { CreateGame } from "@/components/composite/create-game"

export default function LobbyPage() {
    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-background">
            <div className="flex w-full max-w-sm flex-col gap-6">
                <Tabs defaultValue="join" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="join">Join Group</TabsTrigger>
                        <TabsTrigger value="create">Create Group</TabsTrigger>
                    </TabsList>
                    <TabsContent value="join">
                        <JoinGame />
                    </TabsContent>
                    <TabsContent value="create">
                        <CreateGame />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}
