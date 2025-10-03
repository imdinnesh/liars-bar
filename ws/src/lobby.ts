import { Player } from "./lobby.types";

export class Lobby {
    private players: Map<string, Player> = new Map();
    readonly groupId: string;
    private readonly MAX_SIZE = 4;
    public owner: Player | null = null;

    constructor(groupId: string = "default-group") {
        this.groupId = groupId;
    }

    addPlayer(name: string): Player | null {
        if (this.players.size >= this.MAX_SIZE) {
            return null;
        }

        const generatedId = crypto.randomUUID();
        const newPlayer: Player = {
            id: generatedId,
            name,
            ready: false,
        };

        this.players.set(generatedId, newPlayer);

        if (this.players.size === 1) {
            this.owner = newPlayer;
        }

        return newPlayer;
    }

    removePlayer(id: string): void {
        this.players.delete(id);

        if (this.owner?.id === id) {
            const nextPlayer = this.players.values().next().value;
            this.owner = nextPlayer || null;
        }
    }

    setPlayerReady(id: string, ready: boolean): void {
        const existingPlayer = this.players.get(id);
        if (existingPlayer) {
            existingPlayer.ready = ready;
        }
    }

    getPlayers(): Player[] {
        return Array.from(this.players.values()).map(p => ({
            id: p.id,
            name: p.name,
            ready: p.ready,
        }));
    }

    getLobbyState() {
        return {
            ownerId: this.owner?.id || null,
            players: this.getPlayers(),
        };
    }

    allReady(): boolean {
        return this.getPlayers().length > 0 && this.getPlayers().every(p => p.ready);
    }

    isFull(): boolean {
        return this.players.size >= this.MAX_SIZE;
    }
}