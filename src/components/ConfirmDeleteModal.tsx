import { Box, Button, Modal, Typography } from '@mui/material';
import { useMemo } from 'react';

import { useAppContext } from '../hooks';
import { isPointSelected } from '../utils';

interface ConfirmDeleteModalProps {
    isModalOpen?: boolean;
    onClose?: () => void;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = (props) => {
    const { isModalOpen = false, onClose } = props;

    const {
        actions: { deleteMapData },
        state: { isSelectionInverted, mapData, selection, excludedRegions }
    } = useAppContext();

    const filesToDelete = useMemo(() => {
        if (!selection) {
            return 0;
        }

        return mapData.filter((point) => isPointSelected(point, selection, isSelectionInverted, excludedRegions)).length;
    }, [mapData, selection, isSelectionInverted]);

    return (
        <Modal
            open={isModalOpen}
            onClose={() => onClose?.()}
            onMouseDownCapture={(e) => {
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.stopPropagation();
            }}
            onMouseUpCapture={(e) => {
                e.nativeEvent.stopImmediatePropagation();
                e.nativeEvent.stopPropagation();
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #000',
                    boxShadow: 24,
                    p: 4
                }}
            >
                <Typography variant="h6" component="h2">
                    Delete?
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    Are you sure you would like to delete {filesToDelete} chunk{filesToDelete > 1 ? 's' : ''}?
                </Typography>
                <Typography sx={{ mt: 2 }}>
                    This action is not reversible! Make sure you back up your save folder before proceeding!
                </Typography>
                <Button
                    color="error"
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => {
                        if (!filesToDelete) {
                            onClose?.();
                            console.error('');
                            return;
                        }

                        deleteMapData();

                        onClose?.();
                    }}
                >
                    Delete forever!
                </Button>
                <Button
                    style={{ marginLeft: 16 }}
                    sx={{ mt: 2 }}
                    onClick={() => {
                        onClose?.();
                    }}
                >
                    Cancel
                </Button>
            </Box>
        </Modal>
    );
};
