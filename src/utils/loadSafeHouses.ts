import type { SafeHouse } from '../types';

import { BinaryReader } from './BinaryReader';

const loadFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const result = event.target?.result;
            if (result instanceof ArrayBuffer) {
                resolve(result);
            }
            reject(new Error('Invalid return type!'));
        };
        reader.onerror = (error) => {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
};

export const loadSafeHouses = async (directoryHandle: FileSystemDirectoryHandle): Promise<SafeHouse[]> => {
    const safeHouses: SafeHouse[] = [];

    const fileHandle = await directoryHandle.getFileHandle('map_meta.bin');
    const file = await fileHandle.getFile();
    const arrayBuffer = await loadFileAsArrayBuffer(file);

    const reader = new BinaryReader(arrayBuffer);

    reader.mark();

    const fileType = reader.readString(4);

    let version = 0;
    if (fileType === 'META') {
        version = reader.readInt32();
    } else {
        version = 33;
        reader.reset();
    }

    if (version < 194) {
        throw new Error(`File version ${version} not supported!`);
    }

    const minX = reader.readInt32();
    const minY = reader.readInt32();
    const maxX = reader.readInt32();
    const maxY = reader.readInt32();

    for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
            const roomDefCount = reader.readInt32();
            for (let i = 0; i < roomDefCount; i++) {
                if (version < 194) {
                    reader.skipBytes(4);
                } else {
                    reader.skipBytes(8);
                }
                if (version >= 160) {
                    reader.skipBytes(2);
                } else {
                    reader.skipBytes(1);
                    if (version >= 34) {
                        reader.skipBytes(1);
                    }
                }
            }

            const buildingDefCount = reader.readInt32();
            for (let i = 0; i < buildingDefCount; i++) {
                version >= 194 && reader.skipBytes(8);
                reader.skipBytes(1);
                version >= 57 && reader.skipBytes(4);
                version >= 74 && reader.skipBytes(1);
                version >= 107 && reader.skipBytes(1);
                version >= 111 && version < 121 && reader.skipBytes(4);
                version >= 125 && reader.skipBytes(4);
            }
        }
    }

    if (version <= 112) {
        throw new Error('Zones not supported!');
    }

    const safeHouseCount = reader.readInt32();
    for (let i = 0; i < safeHouseCount; i++) {
        const x = reader.readInt32();
        const y = reader.readInt32();
        const w = reader.readInt32();
        const h = reader.readInt32();
        const owner = reader.readString();
        const playerCount = reader.readInt32();
        const players: string[] = [];
        for (let j = 0; j < playerCount; j++) {
            const player = reader.readString();
            players.push(player);
        }
        reader.skipBytes(8); // long - last visited
        let title = `${owner}'s safe house`;
        if (version >= 101) {
            title = reader.readString();
        }

        if (version >= 177) {
            const playerRespawnCount = reader.readInt32();
            for (let j = 0; j < playerRespawnCount; j++) {
                reader.readString();
            }
        }

        safeHouses.push({
            region: [
                { x: Math.floor(x / 10), y: Math.floor(y / 10) },
                { x: Math.ceil((x + w) / 10), y: Math.ceil((y + h) / 10) }
            ],
            owner,
            players,
            title
        });
    }

    return safeHouses;
};
