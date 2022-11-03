import type { Coordinate } from '../types';

export const loadMapData = async (directoryHandle: FileSystemDirectoryHandle): Promise<Coordinate[]> => {
    const mapData: Coordinate[] = [];

    const regex = new RegExp(/map_(\d+)_(\d+).bin/);

    for await (const fileName of directoryHandle.keys()) {
        const match = regex.exec(fileName);

        if (match) {
            const [_, x, y] = match;
            mapData.push({ x: parseInt(x), y: parseInt(y) });
        }
    }

    return mapData;
};
