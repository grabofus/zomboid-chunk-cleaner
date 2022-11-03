import { Paper } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

import { MAP_PADDING } from '../constants';
import { useAppContext } from '../hooks';
import type { Coordinate } from '../types';
import { isPointSelected } from '../utils/isPointSelected';

export const MapDisplay: React.FC = () => {
    const {
        actions: { selectRegion, unselectRegion },
        state: { isMapDisplayed, isSelectionInverted, mapData, selection }
    } = useAppContext();

    const mapCanvasRef = useRef<HTMLCanvasElement>(null);
    const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

    const [zoomLevel, setZoomLevel] = useState(1);

    // Calculate map tiles to display
    const tileInfo = useMemo(() => {
        let maxX = 0;
        let maxY = 0;
        let minX = 20000;
        let minY = 20000;

        for (const { x, y } of mapData) {
            maxX = Math.max(x, maxX);
            maxY = Math.max(y, maxY);
            minX = Math.min(x, minX);
            minY = Math.min(y, minY);
        }

        maxX += MAP_PADDING;
        maxY += MAP_PADDING;
        minX -= MAP_PADDING;
        minY -= MAP_PADDING;

        const tiles = [];
        for (let y = Math.floor(minY / 100); y <= Math.floor(maxY / 100); y++) {
            for (let x = Math.floor(minX / 100); x <= Math.floor(maxX / 100); x++) {
                tiles.push(`${x}_${y}`);
            }
        }

        const columnCount = Math.floor(maxX / 100) - Math.floor(minX / 100) + 1;

        return {
            maxX,
            maxY,
            minX,
            minY,
            tiles,
            columnCount
        };
    }, [mapData]);

    // Redraw chunks when map data or selection changes
    useEffect(() => {
        const mapCanvas = mapCanvasRef.current;
        const selectionCanvas = selectionCanvasRef.current;
        if (!mapCanvas || !selectionCanvas) {
            return;
        }

        const context = mapCanvas.getContext('2d');
        if (!context) {
            return;
        }

        const { maxX, maxY, minX, minY } = tileInfo;

        const canvasWidth = Math.max(1, (maxX - minX) * zoomLevel);
        const canvasHeight = Math.max(1, (maxY - minY) * zoomLevel);

        selectionCanvas.width = mapCanvas.width = canvasWidth;
        selectionCanvas.height = mapCanvas.height = canvasHeight;

        context.fillStyle = 'hsla(0, 0%, 10%, 0)';
        context.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw generated chunks
        for (const point of mapData) {
            const isSelected = selection && isPointSelected(point, selection, isSelectionInverted);
            context.fillStyle = isSelected ? 'hsla(0, 100%, 76%, 70%)' : 'hsla(41, 49%, 76%, 70%)';
            context.fillRect((point.x - minX) * zoomLevel, (point.y - minY) * zoomLevel, 1 * zoomLevel, 1 * zoomLevel);
        }
    }, [mapData, tileInfo, selection, isSelectionInverted]);

    // Draw pending selection over map canvas
    useEffect(() => {
        const canvas = selectionCanvasRef.current;
        if (!canvas) {
            return;
        }

        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }

        let mousePos: Coordinate = { x: 0, y: 0 };
        let selectionStart: Coordinate | undefined;
        let isSelectionInverted: boolean;

        const { minX: offsetX, minY: offsetY } = tileInfo;

        const getMousePosition = (e: MouseEvent): Coordinate & { isOverCanvas: boolean } => {
            const canvasRect = canvas.getBoundingClientRect();
            const x = e.clientX - Math.floor(canvasRect.left);
            const y = e.clientY - Math.floor(canvasRect.top);
            const isOverCanvas = 0 <= x && x < canvasRect.width && 0 <= y && y < canvasRect.height;
            return { x: x + offsetX, y: y + offsetY, isOverCanvas };
        };

        const draw = () => {
            const mouseX = mousePos.x;
            const mouseY = mousePos.y;

            context.clearRect(0, 0, canvas.width, canvas.height);

            if (selectionStart) {
                const selectionX = selectionStart.x;
                const selectionY = selectionStart.y;

                context.fillStyle = '#f664';
                if (isSelectionInverted) {
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.clearRect(selectionX - offsetX, selectionY - offsetY, mouseX - selectionX, mouseY - selectionY);
                } else {
                    context.fillRect(selectionX - offsetX, selectionY - offsetY, mouseX - selectionX, mouseY - selectionY);
                }

                context.strokeStyle = '#f66c';
                context.strokeRect(selectionX - offsetX, selectionY - offsetY, mouseX - selectionX, mouseY - selectionY);
            }

            context.fillStyle = 'rgba(0,0,0,0.3)';
            const { width } = context.measureText(`X: ${mouseX} Y: ${mouseY}`);
            context.fillRect(0, 0, width + 12, 18);
            context.fillStyle = 'white';
            context.fillText(`X: ${mouseX} Y: ${mouseY}`, 4, 12);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos = getMousePosition(e);
            draw();
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (!getMousePosition(e).isOverCanvas) {
                return;
            }

            e.preventDefault();
            selectionStart = getMousePosition(e);
            isSelectionInverted = e.ctrlKey;
            unselectRegion();
            draw();
        };

        const handleMouseUp = (e: MouseEvent) => {
            e.preventDefault();

            if (!selectionStart) {
                return;
            }

            const mouseX = mousePos.x;
            const mouseY = mousePos.y;
            const selectionX = selectionStart.x;
            const selectionY = selectionStart.y;

            const topLeft = {
                x: Math.min(mouseX, selectionX),
                y: Math.min(mouseY, selectionY)
            };
            const bottomRight = {
                x: Math.max(mouseX, selectionX),
                y: Math.max(mouseY, selectionY)
            };

            selectionStart = undefined;
            draw();
            selectRegion([topLeft, bottomRight], isSelectionInverted);
        };

        document.body.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('mousedown', handleMouseDown);
        document.body.addEventListener('mouseup', handleMouseUp);

        draw();

        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('mousedown', handleMouseDown);
            document.body.removeEventListener('mouseup', handleMouseUp);
        };
    }, [tileInfo, selectRegion, unselectRegion]);

    return (
        <Paper
            style={{
                padding: '1rem',
                display: mapData.length > 0 ? 'grid' : 'none',
                contain: 'paint'
            }}
        >
            {isMapDisplayed && (
                <div
                    style={{
                        width: tileInfo.maxX - tileInfo.minX,
                        height: tileInfo.maxY - tileInfo.minY,
                        overflow: 'hidden',
                        gridArea: '1 / 1',
                        backgroundColor: 'rgba(0,0,0,0.2)'
                    }}
                >
                    <div
                        style={{
                            marginLeft: -(tileInfo.minX % 100),
                            marginTop: -(tileInfo.minY % 100),
                            display: 'grid',
                            gridTemplateColumns: `repeat(${tileInfo.columnCount}, 100px)`,
                            zIndex: 0
                        }}
                    >
                        {tileInfo.tiles.map((id) => (
                            <img
                                key={id}
                                className="tile"
                                src={`./assets/map_${id}.png`}
                                onLoad={(e) => {
                                    e.currentTarget.classList.add('loaded');
                                }}
                            ></img>
                        ))}
                    </div>
                </div>
            )}
            <canvas
                ref={mapCanvasRef}
                style={{ zIndex: 1, gridArea: '1 / 1', backgroundColor: isMapDisplayed ? undefined : 'hsla(41, 30%, 61%, 1)' }}
            ></canvas>
            <canvas ref={selectionCanvasRef} style={{ zIndex: 2, gridArea: '1 / 1' }}></canvas>
        </Paper>
    );
};
