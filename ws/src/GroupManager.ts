import { Lobby } from "./lobby";
import { Player } from "./lobby.types";

export class GroupManager {
    private groups = new Map<string, Lobby>();

    createGroup(ownerName: string): { groupId: string; owner: Player | null } {
        const groupId = crypto.randomUUID();
        const newLobby = new Lobby(groupId);
        const owner = newLobby.addPlayer(ownerName);
        
        this.groups.set(groupId, newLobby);

        return { groupId, owner };
    }

    getGroup(groupId: string): Lobby | undefined {
        return this.groups.get(groupId);
    }

    removeGroup(groupId: string): void {
        this.groups.delete(groupId);
    }

    getAllGroups(): Lobby[] {
        return Array.from(this.groups.values());
    }
}