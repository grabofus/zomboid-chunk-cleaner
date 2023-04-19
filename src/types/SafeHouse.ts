import type { Region } from './Region';

export interface SafeHouse {
    region: Region;
    owner: string;
    players: string[];
    title: string;
}
