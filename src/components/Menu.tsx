import { Button, Checkbox, Collapse, FormControl, FormControlLabel, InputLabel, MenuItem, Select } from '@mui/material';
import { useMemo, useState } from 'react';

import { useAppContext } from '../hooks';
import { isPointSelected } from '../utils';

interface MenuProps {
    onDelete?: () => void;
}

export const Menu: React.FC<MenuProps> = (props) => {
    const { onDelete } = props;

    const {
        actions: { loadMapData, setZoomLevel, toggleMap, setIsSafeHouseProtectionEnabled },
        state: { isMapDisplayed, isSelectionInverted, mapData, selection, zoomLevel, isSafeHouseProtectionEnabled, excludedRegions }
    } = useAppContext();

    const [showInfo, setShowInfo] = useState(true);

    const filesToDelete = useMemo(() => {
        if (!selection) {
            return 0;
        }

        return mapData.filter((point) => isPointSelected(point, selection, isSelectionInverted, excludedRegions)).length;
    }, [mapData, selection, isSelectionInverted, excludedRegions]);

    return (
        <>
            <div style={{ display: 'flex', gap: 16, width: 1200 }}>
                <Button variant="contained" onClick={() => loadMapData()}>
                    Load map data
                </Button>
                <Button variant="contained" color="error" disabled={filesToDelete === 0} onClick={() => onDelete?.()}>
                    Delete {filesToDelete} chunks
                </Button>
                <div className="spacer"></div>
                <FormControlLabel
                    control={<Checkbox checked={isMapDisplayed} onChange={(_, value) => toggleMap(value)} />}
                    label="Overlay Knox Country"
                />
                <FormControlLabel
                    control={
                        <Checkbox checked={isSafeHouseProtectionEnabled} onChange={(_, value) => setIsSafeHouseProtectionEnabled(value)} />
                    }
                    label="Protect Safehouses"
                />
                <FormControlLabel
                    control={<Checkbox checked={showInfo} onChange={(_, value) => setShowInfo(value)} />}
                    label="Show Guide"
                />
                <FormControl>
                    <InputLabel id="zoom-level-label">Zoom level</InputLabel>
                    <Select
                        labelId="zoom-level-label"
                        id="zoom-level"
                        value={zoomLevel}
                        label="Zoom level"
                        onChange={(e) => {
                            const { value } = e.target;
                            if (typeof value !== 'number') {
                                return;
                            }
                            setZoomLevel(value);
                        }}
                    >
                        <MenuItem value={0.5}>50%</MenuItem>
                        <MenuItem value={1}>100%</MenuItem>
                        <MenuItem value={2}>200%</MenuItem>
                        <MenuItem value={4}>400%</MenuItem>
                        <MenuItem value={8}>800%</MenuItem>
                    </Select>
                </FormControl>
            </div>
            <Collapse in={showInfo}>
                <ul>
                    <li>
                        Load your save folder, usually: <code>C:\Users\YourName\Zomboid\Saves\Survivor\21-01-2022_12-36-36</code>
                    </li>
                    <li>Drag with the mouse to create a selection</li>
                    <li>
                        Hold <code>Ctrl</code> before selecting a region to invert it
                    </li>
                </ul>
            </Collapse>
        </>
    );
};
