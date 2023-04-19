import { createContext } from 'react';

import type { AppContextValue } from '../types';

const err = () => {
    throw new Error('Invalid invocation outside of AppContext!');
};

export const AppContext = createContext<AppContextValue>({
    actions: {
        deleteMapData: err,
        loadMapData: err,
        selectRegion: err,
        unselectRegion: err,
        setIsSafeHouseProtectionEnabled: err,
        setSafeHousePadding: err,
        setZoomLevel: err,
        toggleMap: err
    },
    state: {
        excludedRegions: [],
        isMapDisplayed: true,
        isSafeHouseProtectionEnabled: true,
        isSelectionInverted: false,
        mapData: [],
        safeHousePadding: 4,
        safeHouses: [],
        selection: undefined,
        zoomLevel: 1
    }
});
