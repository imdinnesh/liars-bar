"use client";

import { useState } from "react";
import { LobbyEvent } from "@/lib/lobby.types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useLobbyStore } from "@/store/lobby.store";

export function CreateGame() {
  const { sendMessage, isConnected } = useLobbyStore();
  const [name, setName] = useState("");

  const handleCreate = () => {
    if (!isConnected) return alert("Not connected to server");
    sendMessage({
      event: LobbyEvent.CREATE_GROUP,
      payload: { name },
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Game</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Input
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={!isConnected}>
          Create Group
        </Button>
      </CardContent>
    </Card>
  );
}
