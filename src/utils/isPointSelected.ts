import type { Coordinate, Region } from '../types';

import { isPointInRegion } from './isPointInRegion';

export const isPointSelected = (point: Coordinate, region: Region, isSelectionInverted: boolean, excludedRegions: Region[]): boolean => {
    for (const excludedRegion of excludedRegions) {
        const isPointExcluded = isPointInRegion(point, excludedRegion);
        if (isPointExcluded) {
            return false;
        }
    }
    let isSelected = isPointInRegion(point, region);
    if (isSelectionInverted) {
        isSelected = !isSelected;
    }
    return isSelected;
};
