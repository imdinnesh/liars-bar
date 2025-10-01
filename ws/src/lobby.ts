import { Player } from "./lobby.types";

export class Lobby {
    // Map of player ID to Player object
    private players: Map<string, Player> = new Map();
    readonly groupId: string; // Unique identifier for the lobby
    private readonly MAX_SIZE = 4; // Maximum number of players allowed
    public owner: Player | null = null; // Owner of the lobby

    constructor(groupId: string = "default-group") {
        this.groupId = groupId;
    }

    // Add a new player to the lobby (reject if full)
    addPlayer(name: string): Player | null {
        if (this.players.size >= this.MAX_SIZE) {
            return null; // group full
        }

        const generatedId = crypto.randomUUID();
        const newPlayer: Player = {
            id: generatedId,
            name,
            ready: false,
        };

        this.players.set(generatedId, newPlayer);

        // If this is the first player in the lobby, make them the owner
        if (this.players.size === 1) {
            this.owner = newPlayer;
        }

        return newPlayer;
    }

    // Remove a player from the lobby by ID
    removePlayer(id: string): void {
        this.players.delete(id);

        // If owner left, assign a new owner (first player remaining)
        if (this.owner?.id === id) {
            const nextPlayer = this.players.values().next().value;
            this.owner = nextPlayer || null;
        }
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

    // Check if the lobby is full
    isFull(): boolean {
        return this.players.size >= this.MAX_SIZE;
    }
}
