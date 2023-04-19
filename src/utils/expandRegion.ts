import type { Region } from '../types';

export const expandRegion = (region: Region, padding: number): Region => {
    const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = region;
    return [
        {
            x: x1 - padding,
            y: y1 - padding
        },
        {
            x: x2 + padding,
            y: y2 + padding
        }
    ];
};
