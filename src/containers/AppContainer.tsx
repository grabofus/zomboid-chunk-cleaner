import { useEffect, useMemo, useRef, useState } from 'react';

import { AppContext } from '../contexts';
import type { AppContextValue, Coordinate, Region, SafeHouse } from '../types';
import { deleteMapData, expandRegion, loadMapData, loadSafeHouses } from '../utils';

interface SelectionInfo {
    isSelectionInverted: boolean;
    selection: Region;
}

interface DeleteFiles {
    mapData: Coordinate[];
    selectionInfo?: SelectionInfo;
    excludedRegions: Region[];
}

export const AppContainer: React.FC = (props) => {
    const directoryHandleRef = useRef<FileSystemDirectoryHandle>();

    const [isMapDisplayed, setIsMapDisplayed] = useState<boolean>(true);
    const [selectionInfo, setSelectionInfo] = useState<SelectionInfo | undefined>(undefined);
    const [mapData, setMapData] = useState<Coordinate[]>([]);
    const [zoomLevel, setZoomLevel] = useState<number>(1);

    const [isSafeHouseProtectionEnabled, setIsSafeHouseProtectionEnabled] = useState<boolean>(true);
    const [safeHouses, setSafeHouses] = useState<SafeHouse[]>([]);
    const [safeHousePadding, setSafeHousePadding] = useState<number>(4);

    const deleteFilesRef = useRef<DeleteFiles>();

    const excludedRegions = useMemo<Region[]>(() => {
        if (!isSafeHouseProtectionEnabled) {
            return [];
        }
        return safeHouses.map(({ region }) => expandRegion(region, safeHousePadding));
    }, [isSafeHouseProtectionEnabled, safeHousePadding, safeHouses]);

    deleteFilesRef.current = {
        mapData,
        selectionInfo,
        excludedRegions
    };

    const actions = useMemo<AppContextValue['actions']>(() => {
        return {
            deleteMapData: () => {
                if (!deleteFilesRef.current) {
                    throw new Error('Something went wrong!');
                }

                const { excludedRegions, mapData, selectionInfo } = deleteFilesRef.current;
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
                    selectionInfo.isSelectionInverted,
                    excludedRegions
                );

                done.then(() => {
                    setMapData(newMapData);
                });
            },
            loadMapData: async () => {
                directoryHandleRef.current = await window.showDirectoryPicker();

                const mapData = await loadMapData(directoryHandleRef.current);
                const safeHouses = await loadSafeHouses(directoryHandleRef.current).catch((e) => {
                    console.error(
                        'Failed to load safe houses! Please raise an issue on Please raise an issue at https://github.com/grabofus/zomboid-chunk-cleaner/issues',
                        e
                    );
                    return [];
                });

                setMapData(mapData);
                setSafeHouses(safeHouses);
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
            setIsSafeHouseProtectionEnabled: (isSafeHouseProtectionEnabled) => {
                setIsSafeHouseProtectionEnabled(isSafeHouseProtectionEnabled);
            },
            setSafeHousePadding: (safeHousePadding) => {
                setSafeHousePadding(safeHousePadding);
            },
            setZoomLevel: (zoomLevel) => {
                setZoomLevel(zoomLevel);
            },
            toggleMap: (isMapDisplayed) => {
                setIsMapDisplayed(isMapDisplayed);
            }
        };
    }, []);

    useEffect(() => {
        if (!directoryHandleRef.current) {
            return;
        }
    }, []);

    const state = useMemo<AppContextValue['state']>(
        () => ({
            excludedRegions,
            isMapDisplayed,
            isSafeHouseProtectionEnabled,
            isSelectionInverted: selectionInfo?.isSelectionInverted ?? false,
            mapData,
            safeHouses,
            safeHousePadding,
            selection: selectionInfo?.selection,
            zoomLevel
        }),
        [isMapDisplayed, isSafeHouseProtectionEnabled, mapData, safeHousePadding, safeHouses, selectionInfo, zoomLevel]
    );

    const value = useMemo(() => ({ actions, state }), [actions, state]);

    return <AppContext.Provider value={value}>{props.children}</AppContext.Provider>;
};
