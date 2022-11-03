import type { Coordinate } from './Coordinate';
import type { Region } from './Region';

export interface AppContextValue {
    actions: {
        deleteMapData: () => void;
        loadMapData: () => Promise<void>;
        selectRegion: (region: Region, isSelectionInverted?: boolean) => void;
        unselectRegion: () => void;
        toggleMap: (isMapDisplayed: boolean) => void;
    };
    state: {
        isMapDisplayed: boolean;
        isSelectionInverted: boolean;
        mapData: Coordinate[];
        selection: Region | undefined;
    };
}
