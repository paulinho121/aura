
import { CosmosClient } from "@azure/cosmos";
import { UserProfile, Pulse } from "../types";

const endpoint = (import.meta as any).env.VITE_AZURE_COSMOS_ENDPOINT || "";
const key = (import.meta as any).env.VITE_AZURE_COSMOS_KEY || "";

// Only initialize if credentials exist to avoid crashing the whole app
let client: CosmosClient | null = null;
if (endpoint && key) {
    try {
        client = new CosmosClient({ endpoint, key });
    } catch (e) {
        console.warn("Failed to initialize CosmosClient:", e);
    }
}

const databaseId = "AuraDB";
const usersContainerId = "Users";
const pulsesContainerId = "Pulses";

export class AzureService {
    private get db() { return client?.database(databaseId); }
    private get usersContainer() { return this.db?.container(usersContainerId); }
    private get pulsesContainer() { return this.db?.container(pulsesContainerId); }

    // Users
    async getUsers(): Promise<UserProfile[]> {
        if (!this.usersContainer) return [];
        try {
            const { resources } = await this.usersContainer.items.readAll<UserProfile>().fetchAll();
            return resources;
        } catch (error) {
            console.error("Error fetching users:", error);
            return [];
        }
    }

    async saveUser(user: UserProfile): Promise<void> {
        if (!this.usersContainer) {
            console.warn("Cosmos DB users container not initialized. Cannot save user.");
            return;
        }
        try {
            await this.usersContainer.items.upsert(user);
        } catch (error) {
            console.error("Error saving user:", error);
        }
    }

    // Pulses
    async getPulses(): Promise<Pulse[]> {
        if (!this.pulsesContainer) return [];
        try {
            const { resources } = await this.pulsesContainer.items
                .query("SELECT * FROM c ORDER BY c.timestamp DESC")
                .fetchAll();
            return resources;
        } catch (error) {
            console.error("Error fetching pulses:", error);
            return [];
        }
    }

    async savePulse(pulse: Pulse): Promise<void> {
        if (!this.pulsesContainer) return;
        try {
            await this.pulsesContainer.items.create(pulse);
        } catch (error) {
            console.error("Error saving pulse:", error);
        }
    }

    async resonatePulse(pulseId: string, userId: string): Promise<void> {
        if (!this.pulsesContainer) return;
        try {
            const { resource: pulse } = await this.pulsesContainer.item(pulseId, pulseId).read<Pulse>();
            if (pulse) {
                pulse.resonanceCount += 1;
                await this.pulsesContainer.item(pulseId, pulseId).replace(pulse);
            }
        } catch (error) {
            console.error("Error resonating pulse:", error);
        }
    }
}

export const azureService = new AzureService();
