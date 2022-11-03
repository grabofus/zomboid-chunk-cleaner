import type { Coordinate, Region } from '../types';

export const isPointInRegion = (point: Coordinate, region: Region): boolean => {
    const [from, to] = region;
    return from.x <= point.x && point.x < to.x && from.y <= point.y && point.y < to.y;
};
