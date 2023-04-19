import type { Coordinate } from './Coordinate';
import type { Region } from './Region';
import type { SafeHouse } from './SafeHouse';

export interface AppContextValue {
    actions: {
        deleteMapData: () => void;
        loadMapData: () => Promise<void>;
        selectRegion: (region: Region, isSelectionInverted?: boolean) => void;
        unselectRegion: () => void;
        setIsSafeHouseProtectionEnabled: (isSafeHouseProtectionEnabled: boolean) => void;
        setSafeHousePadding: (safeHousePadding: number) => void;
        setZoomLevel: (zoomLevel: number) => void;
        toggleMap: (isMapDisplayed: boolean) => void;
    };
    state: {
        excludedRegions: Region[];
        isMapDisplayed: boolean;
        isSafeHouseProtectionEnabled: boolean;
        isSelectionInverted: boolean;
        mapData: Coordinate[];
        safeHouses: SafeHouse[];
        safeHousePadding: number;
        selection: Region | undefined;
        zoomLevel: number;
    };
}
