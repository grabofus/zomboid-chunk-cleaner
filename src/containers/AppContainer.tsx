import { useMemo, useRef, useState } from 'react';

import { AppContext } from '../contexts';
import type { AppContextValue, Coordinate, Region } from '../types';
import { deleteMapData, loadMapData } from '../utils';

interface SelectionInfo {
    isSelectionInverted: boolean;
    selection: Region;
}

interface DeleteFiles {
    mapData: Coordinate[];
    selectionInfo?: SelectionInfo;
}

export const AppContainer: React.FC = (props) => {
    const directoryHandleRef = useRef<FileSystemDirectoryHandle>();

    const [isMapDisplayed, setIsMapDisplayed] = useState<boolean>(true);
    const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | undefined>(undefined);
    const [mapData, setMapData] = useState<Coordinate[]>([]);

    const deleteFilesRef = useRef<DeleteFiles>();
    deleteFilesRef.current = {
        mapData,
        selectionInfo
    };

    const actions = useMemo<AppContextValue['actions']>(() => {
        return {
            deleteMapData: () => {
                if (!deleteFilesRef.current) {
                    throw new Error('Something went wrong!');
                }

                const { mapData, selectionInfo } = deleteFilesRef.current;
                if (!directoryHandleRef.current) {
                    console.error('No directory handle found! Cannot delete map files!');
                    return [mapData, Promise.resolve()];
                }

                if (!selectionInfo) {
                    return [mapData, Promise.resolve()];
                }

                const [newMapData, done] = deleteMapData(
                    directoryHandleRef.current,
                    mapData,
                    selectionInfo.selection,
                    selectionInfo.isSelectionInverted
                );

                done.then(() => {
                    setMapData(newMapData);
                });
            },
            loadMapData: async () => {
                directoryHandleRef.current = await window.showDirectoryPicker();

                const mapData = await loadMapData(directoryHandleRef.current);

                setMapData(mapData);
            },
            selectRegion: (region, isSelectionInverted) => {
                setSelectionInfo({
                    selection: region,
                    isSelectionInverted: isSelectionInverted ?? false
                });
            },
            unselectRegion: () => {
                setSelectionInfo(undefined);
            },
            toggleMap: (isMapDisplayed) => {
                setIsMapDisplayed(isMapDisplayed);
            }
        };
    }, []);

    const state = useMemo<AppContextValue['state']>(
        () => ({
            isMapDisplayed,
            isSelectionInverted: selectionInfo?.isSelectionInverted ?? false,
            mapData,
            selection: selectionInfo?.selection
        }),
        [isMapDisplayed, mapData, selectionInfo]
    );

    const value = useMemo(() => ({ actions, state }), [actions, state]);

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
