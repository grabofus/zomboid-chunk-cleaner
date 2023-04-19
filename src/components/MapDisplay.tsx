import { Paper } from '@mui/material';
import { useEffect, useMemo, useRef } from 'react';

import { MAP_PADDING } from '../constants';
import { useAppContext } from '../hooks';
import type { Coordinate, Region } from '../types';
import { expandRegion, isChildOf, isPointSelected } from '../utils';

enum Colors {
    SAFE_HOUSE = 'hsla(100, 100%, 76%, 70%)',
    SAFE_HOUSE_SURROUNDING = 'hsla(100, 100%, 76%, 40%)',
    DELETE = 'hsla(0, 100%, 76%, 70%)',
    DEFAULT = 'hsla(41, 49%, 76%, 70%)',
    TEXT_BACKGROUND = 'rgba(0, 0, 0, 0.3)',
    TEXT_COLOR = '#fff'
}

export const MapDisplay: React.FC = () => {
    const {
        actions: { selectRegion, unselectRegion },
        state: {
            excludedRegions,
            isMapDisplayed,
            isSafeHouseProtectionEnabled,
            isSelectionInverted,
            mapData,
            safeHouses,
            safeHousePadding,
            selection,
            zoomLevel
        }
    } = useAppContext();

    const mapRootRef = useRef<HTMLDivElement>(null);
    const mapCanvasRef = useRef<HTMLCanvasElement>(null);
    const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

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

        const fillRect = (x: number, y: number, w: number, h: number) => {
            context.fillRect((x - minX) * zoomLevel, (y - minY) * zoomLevel, w * zoomLevel, h * zoomLevel);
        };
        const fillRectRegion = (region: Region) => {
            const [{ x: x1, y: y1 }, { x: x2, y: y2 }] = region;
            fillRect(x1, y1, x2 - x1, y2 - y1);
        };
        const writeTextAboveRegion = (region: Region, text: string) => {
            const { width: textWidth, ...rest } = context.measureText(text);

            const [{ x: x1, y: y1 }, { x: x2 }] = region;

            const w = x2 - x1;
            const x = x1 + w / 2 - textWidth / zoomLevel / 2;
            const padding = 4;
            const lineHeight = 8;
            const y = y1;
            const offsetY = -8;

            context.fillStyle = Colors.TEXT_BACKGROUND;
            context.fillRect(
                (x - minX) * zoomLevel - padding,
                (y - minY) * zoomLevel - lineHeight - padding + offsetY,
                textWidth + padding * 2,
                lineHeight + padding * 2
            );

            context.fillStyle = Colors.TEXT_COLOR;
            context.fillText(text, (x - minX) * zoomLevel, (y - minY) * zoomLevel + offsetY);
        };

        // Draw generated chunks
        for (const point of mapData) {
            const isSelected = selection && isPointSelected(point, selection, isSelectionInverted, excludedRegions);
            context.fillStyle = isSelected ? Colors.DELETE : Colors.DEFAULT;
            fillRect(point.x, point.y, 1, 1);
        }

        if (isSafeHouseProtectionEnabled) {
            // Draw safe houses
            for (const safeHouse of safeHouses) {
                const { region, owner } = safeHouse;

                const tooltip = `${owner}'s safehouse`;

                context.fillStyle = Colors.SAFE_HOUSE;
                fillRectRegion(region);

                const expandedRegion = expandRegion(region, safeHousePadding);
                context.fillStyle = Colors.SAFE_HOUSE_SURROUNDING;
                fillRectRegion(expandedRegion);

                writeTextAboveRegion(expandedRegion, tooltip);
            }
        }
    }, [
        mapData,
        tileInfo,
        isSafeHouseProtectionEnabled,
        safeHousePadding,
        safeHouses,
        selection,
        isSelectionInverted,
        zoomLevel,
        excludedRegions
    ]);

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

        const getMousePosition = (e: MouseEvent): Coordinate => {
            const canvasRect = canvas.getBoundingClientRect();
            const x = e.clientX - Math.floor(canvasRect.left);
            const y = e.clientY - Math.floor(canvasRect.top);
            return {
                x: Math.floor(x / zoomLevel + offsetX),
                y: Math.floor(y / zoomLevel + offsetY)
            };
        };

        const draw = () => {
            const mouseX = mousePos.x;
            const mouseY = mousePos.y;

            context.clearRect(0, 0, canvas.width, canvas.height);

            if (selectionStart) {
                const selectionX = selectionStart.x;
                const selectionY = selectionStart.y;

                const rectX = (selectionX - offsetX) * zoomLevel;
                const rectY = (selectionY - offsetY) * zoomLevel;
                const rectWidth = (mouseX - selectionX) * zoomLevel;
                const rectHeight = (mouseY - selectionY) * zoomLevel;

                context.fillStyle = '#f664';
                if (isSelectionInverted) {
                    context.fillRect(0, 0, canvas.width, canvas.height);
                    context.clearRect(rectX, rectY, rectWidth, rectHeight);
                } else {
                    context.fillRect(rectX, rectY, rectWidth, rectHeight);
                }

                context.strokeStyle = '#f66c';
                context.strokeRect(rectX, rectY, rectWidth, rectHeight);
            }

            context.fillStyle = Colors.TEXT_BACKGROUND;
            const { width } = context.measureText(`X: ${mouseX} Y: ${mouseY}`);
            context.fillRect(0, 0, width + 12, 18);
            context.fillStyle = Colors.TEXT_COLOR;
            context.fillText(`X: ${mouseX} Y: ${mouseY}`, 4, 12);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePos = getMousePosition(e);
            draw();
        };

        const handleMouseDown = (e: MouseEvent) => {
            if (e.button !== 0) {
                return;
            }

            if (!(e.target instanceof HTMLElement) || !mapRootRef.current || !isChildOf(e.target, mapRootRef.current)) {
                return;
            }

            e.preventDefault();
            selectionStart = getMousePosition(e);
            isSelectionInverted = e.ctrlKey;
            unselectRegion();
            draw();
        };

        const handleMouseUp = (e: MouseEvent) => {
            if (e.button !== 0) {
                return;
            }

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
    }, [tileInfo, selectRegion, unselectRegion, zoomLevel]);

    if (!mapData.length) {
        return null;
    }

    return (
        <Paper
            style={{
                padding: '1rem',
                userSelect: 'none'
            }}
        >
            <div
                ref={mapRootRef}
                style={{
                    display: mapData.length > 0 ? 'grid' : 'none',
                    contain: 'paint',
                    overflow: 'auto',
                    maxHeight: '80vh',
                    maxWidth: '80vw'
                }}
            >
                {isMapDisplayed && (
                    <div
                        style={{
                            width: zoomLevel * (tileInfo.maxX - tileInfo.minX),
                            height: zoomLevel * (tileInfo.maxY - tileInfo.minY),
                            overflow: 'hidden',
                            gridArea: '1 / 1',
                            backgroundColor: 'rgba(0,0,0,0.2)'
                        }}
                    >
                        <div
                            style={{
                                marginLeft: zoomLevel * -(tileInfo.minX % 100),
                                marginTop: zoomLevel * -(tileInfo.minY % 100),
                                display: 'grid',
                                gridTemplateColumns: `repeat(${tileInfo.columnCount}, ${zoomLevel * 100}px)`,
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
                                    width={zoomLevel * 100}
                                    height={zoomLevel * 100}
                                    loading="lazy"
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
            </div>
        </Paper>
    );
};
