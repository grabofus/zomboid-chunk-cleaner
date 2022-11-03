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
        toggleMap: err
    },
    state: {
        isMapDisplayed: true,
        isSelectionInverted: false,
        mapData: [],
        selection: undefined
    }
});
