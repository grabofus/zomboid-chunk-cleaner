import type { Coordinate, Region } from '../types';

import { isPointInRegion } from './isPointInRegion';

export const isPointSelected = (point: Coordinate, region: Region, isSelectionInverted: boolean): boolean => {
    let isSelected = isPointInRegion(point, region);
    if (isSelectionInverted) {
        isSelected = !isSelected;
    }
    return isSelected;
};
