import { Button, Checkbox, Collapse, FormControlLabel } from '@mui/material';
import { useMemo, useState } from 'react';

import { useAppContext } from '../hooks';
import { isPointSelected } from '../utils/isPointSelected';

interface MenuProps {
    onDelete?: () => void;
}

export const Menu: React.FC<MenuProps> = (props) => {
    const { onDelete } = props;

    const {
        actions: { loadMapData, toggleMap },
        state: { isMapDisplayed, isSelectionInverted, mapData, selection }
    } = useAppContext();

    const [showInfo, setShowInfo] = useState(false);

    const filesToDelete = useMemo(() => {
        if (!selection) {
            return 0;
        }

        return mapData.filter((point) => isPointSelected(point, selection, isSelectionInverted)).length;
    }, [mapData, selection, isSelectionInverted]);

    return (
        <>
            <div style={{ display: 'flex', gap: 16, width: 800 }}>
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
                <FormControlLabel control={<Checkbox checked={showInfo} onChange={(_, value) => setShowInfo(value)} />} label="Show info" />
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
