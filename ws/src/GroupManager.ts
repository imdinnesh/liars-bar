import { Lobby } from "./lobby";

export class GroupManager {
    // Map of group ID to Lobby instance
    private groups=new Map<string,Lobby>();

    // Create a new group and return its ID
    createGroup(ownerName:string){
        // Generate a unique ID for the group
        const groupId=crypto.randomUUID();
        // Create a new Lobby instance
        const newLobby=new Lobby(groupId);

        // Add the owner as the first player in the lobby
        const owner=newLobby.addPlayer(ownerName);
        
        // Store the new lobby in the groups map
        this.groups.set(groupId,newLobby);

        return {groupId,owner};
    }

    // Get a lobby by its ID
    getGroup(groupId:string){
        return this.groups.get(groupId);
    }

    // Remove a group by its ID
    removeGroup(groupId:string){
        this.groups.delete(groupId);
    }

}