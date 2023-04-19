import type { Coordinate, Region } from '../types';

import { isPointSelected } from './isPointSelected';
import { partition } from './partition';

export const deleteMapData = (
    directoryHandle: FileSystemDirectoryHandle,
    mapData: Coordinate[],
    region: Region,
    isSelectionInverted: boolean,
    excludedRegions: Region[]
): [mapData: Coordinate[], done: Promise<void>] => {
    const [pointsToDelete, pointsToKeep] = partition(mapData, (point) =>
        isPointSelected(point, region, isSelectionInverted, excludedRegions)
    );

    const filesToDelete = pointsToDelete.map(({ x, y }) => `map_${x}_${y}.bin`);

    const done = Promise.all(filesToDelete.map((file) => directoryHandle.removeEntry(file))).then(() => undefined);

    return [pointsToKeep, done];
};
