import { Player } from "./lobby.types";

export class Lobby {

    // Map of player ID to Player object
    private players: Map<string, Player> = new Map();

    // Add a new player to the lobby
    addPlayer(name: string): Player {
        const generatedId = crypto.randomUUID();
        const newPlayer: Player = {
            id: generatedId,
            name: name,
            ready: false
        };

        this.players.set(generatedId, newPlayer);
        return newPlayer;
    }

    // Remove a player from the lobby by ID
    removePlayer(id: string): void {
        this.players.delete(id);
    }

    // Set a player's ready status
    setPlayerReady(id: string, ready: boolean): void {
        const existingPlayer = this.players.get(id);
        if (existingPlayer) {
            existingPlayer.ready = ready;
        }
    }

    // Get a list of all players in the lobby
    getPlayers(): Player[] {
        return Array.from(this.players.values());
    }

    // Check if all players are ready
    allReady(): boolean {
        return this.getPlayers().length > 0 && this.getPlayers().every(p => p.ready);
    }
}