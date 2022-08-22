import './App.css';

import { Box, Button, Checkbox, Collapse, createTheme, CssBaseline, FormControlLabel, Grid, List, ListItem, Modal, Paper, ThemeProvider, Typography } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    showDirectoryPicker(): Promise<any>;
  }
}

interface Coordinate {
  x: number;
  y: number;
}

type Region = [from: Coordinate, to: Coordinate];

let directoryHandle: any;

async function loadMapData(): Promise<Coordinate[]> {
  directoryHandle = await window.showDirectoryPicker();
  const mapData: Coordinate[] = [];

  const regex = new RegExp(/map_(\d+)_(\d+).bin/);

  let i = 0;
  for await (const fileName of directoryHandle.keys()) {
    const match = regex.exec(fileName);

    if (match) {
      const [_, x, y] = match;
      mapData.push({ x: parseInt(x), y: parseInt(y) });
    }
  }

  return mapData;
}

function deleteMapData(mapData: Coordinate[], region: Region, isSelectionInverted: boolean): [mapData: Coordinate[], done: Promise<string>] {
  const fileList = mapData
    .filter((point) => isPointInRegion(point, region, isSelectionInverted))
    .map(({x, y}) => `map_${x}_${y}.bin`);

  const promise = new Promise<string>(async (resolve) => {
    // try {
      for (const file of fileList) {
        console.log('Deleting ', file);
        await directoryHandle.removeEntry(file);
      }
      resolve('');
    // } catch (e) {
    //   resolve((e as any).toString());
    // }
  });
  return [mapData.filter((point) => !isPointInRegion(point, region, isSelectionInverted)), promise];
}

function isPointInRegion(point: Coordinate, region: Region, isSelectionInverted: boolean): boolean {
  const [from, to] = region;
  const isInRegion = from.x <= point.x && point.x <= to.x && from.y <= point.y && point.y <= to.y;
  const isSelected = (!isSelectionInverted && isInRegion) || (isSelectionInverted && !isInRegion);
  return isSelected;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    background: {
      default: '#000'
    }
  },
});

const zoomLevel = 1;
const padding = 100;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selection, setSelection] = useState<Region>();
  const [isSelectionInverted, setIsSelectionInverted] = useState<boolean>(false);
  const [mapData, setMapData] = useState<Coordinate[]>([]);
  const [showMap, setShowMap] = useState(true);
  const [showInfo, setShowInfo] = useState(false);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

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

    maxX += padding;
    maxY += padding;
    minX -= padding;
    minY -= padding;

    const tiles = [];
    for(let y = Math.floor(minY / 100); y <= Math.floor(maxY / 100); y++) {
      for(let x = Math.floor(minX / 100); x <= Math.floor(maxX / 100); x++) {
        tiles.push(`${x}_${y}`);
      }
    }

    return {
      maxX, maxY, minX, minY, tiles
    };
  }, [mapData]);

  // Redraw map when data changes
  useEffect(() => {
    const mapCanvas = mapCanvasRef.current;
    const selectionCanvas = selectionCanvasRef.current;
    if (!mapCanvas || !selectionCanvas) return;

    const context = mapCanvas.getContext('2d');
    if (!context) return;

    const { maxX, maxY, minX, minY } = tileInfo;

    // loadImages(Math.floor(minX / 100), Math.floor(minY / 100), Math.floor(maxX / 100), Math.floor(maxY / 100));

    const canvasWidth = Math.max(1, (maxX - minX) * zoomLevel);
    const canvasHeight = Math.max(1, (maxY - minY) * zoomLevel);

    // const canvasWidth = Math.max(1, (maxX ) * zoomLevel);
    // const canvasHeight = Math.max(1, (maxY ) * zoomLevel);

    selectionCanvas.width = mapCanvas.width = canvasWidth;
    selectionCanvas.height = mapCanvas.height = canvasHeight;

    // context.fillStyle = 'hsla(41, 30%, 61%, 1)';
    context.fillStyle = 'hsla(0, 0%, 10%, 0)';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw generated chunks
    for (const point of mapData) {
      const isSelected = selection && isPointInRegion(point, selection, isSelectionInverted); 
      context.fillStyle = isSelected ? 'hsla(0, 100%, 76%, 70%)' : 'hsla(41, 49%, 76%, 70%)';
      context.fillRect((point.x - minX) * zoomLevel, (point.y - minY) * zoomLevel, 1 * zoomLevel, 1 * zoomLevel);
    }
  }, [mapData, tileInfo, selection, isSelectionInverted]);

  // Track mouse pos
  useEffect(() => {
    const canvas = selectionCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let mousePos: Coordinate = { x: 0, y: 0 };
    let selectionStart: Coordinate | undefined;
    let isSelectionInverted: boolean;

    const {
      minX: offsetX,
      minY: offsetY
    } = tileInfo;

    const getMousePosition = (e: MouseEvent): Coordinate & { isOverCanvas: boolean } => {
      const canvasRect = canvas.getBoundingClientRect();
      const x = e.clientX - Math.floor(canvasRect.left);
      const y = e.clientY - Math.floor(canvasRect.top);
      const isOverCanvas = 0 <= x && x < canvasRect.width && 0 <= y && y < canvasRect.height;
      return { x: x + offsetX, y: y + offsetY, isOverCanvas };
    }

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
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = getMousePosition(e);
      draw();
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!getMousePosition(e).isOverCanvas) return;
      
      e.preventDefault();
      selectionStart = getMousePosition(e);
      isSelectionInverted = e.ctrlKey;
      setSelection(undefined);
      setIsSelectionInverted(isSelectionInverted);
      draw();
    };

    const handleMouseUp = (e: MouseEvent) => {
      e.preventDefault();

      if (!selectionStart) return;

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
      setSelection([topLeft, bottomRight]);
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
  }, [tileInfo]);

  const filesToDelete = useMemo(() => {
    if (selection) {
      return mapData.filter((point) => isPointInRegion(point, selection, isSelectionInverted)).length;
    } else {
      return 0;
    }
  }, [mapData, selection, isSelectionInverted]);

  const columnCount = Math.floor((tileInfo.maxX - tileInfo.minX) / 100) + 1;

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div style={{ display: 'grid', gap: 16 }}>
        <div style={{ display: 'flex', gap: 16, width: 800 }}>
          <Button variant='contained' onClick={() => {
            loadMapData().then((mapData) => {
              setMapData(mapData);
            });
          }}>
            Load map data
          </Button>
          <Button color='error' variant='contained' disabled={filesToDelete === 0} onClick={() => setIsModalOpen(true)}>
            Delete {filesToDelete} chunks
          </Button>
          <div className="spacer"></div>
          <FormControlLabel control={<Checkbox checked={showMap} onChange={(_, value) => setShowMap(value)} />} label="Overlay Knox Country" />
          <FormControlLabel control={<Checkbox checked={showInfo} onChange={(_, value) => setShowInfo(value)} />} label="Show info" />
        </div>
        <Collapse in={showInfo}>
          <ul>
            <li>Load your save folder, usually: <code>C:\Users\YourName\Zomboid\Saves\Survivor\21-01-2022_12-36-36</code></li>
            <li>Drag with the mouse to create a selection</li>
            <li>Hold <code>Ctrl</code> before selecting a region to invert it</li>
          </ul>
        </Collapse>
      </div>
      <div>
        <Paper style={{
          padding: '1rem',
          display: mapData.length > 0 ? 'grid' : 'none',
          contain: 'paint'
        }}>
          {showMap && (
            <div style={{
              width: tileInfo.maxX - tileInfo.minX,
              height: tileInfo.maxY - tileInfo.minY,
              overflow: 'hidden',
              gridArea: '1 / 1',
              backgroundColor: 'rgba(0,0,0,0.2)'
            }}>
              <div style={{
                marginLeft: -(tileInfo.minX % 100),
                marginTop: -(tileInfo.minY % 100),
                display: 'grid',
                gridTemplateColumns: `repeat(${columnCount}, 100px)`,
                zIndex: 0
              }}>
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
          <canvas ref={mapCanvasRef} style={{ zIndex: 1, gridArea: '1 / 1', backgroundColor: showMap ? undefined : 'hsla(41, 30%, 61%, 1)' }}></canvas>
          <canvas ref={selectionCanvasRef} style={{ zIndex: 2, gridArea: '1 / 1' }}></canvas>
        </Paper>
      </div>
      <div className="spacer"></div>
      <div className="coffee">
        <Button style={{ backgroundColor: 'transparent', padding: 0, borderRadius: 8 }} href="https://www.buymeacoffee.com/grabofus">
          <img alt="Buy me a coffee" width="200" src="./assets/coffee.png"></img>
        </Button>
      </div>
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onMouseDownCapture={(e) => {
          e.nativeEvent.stopImmediatePropagation();
          e.nativeEvent.stopPropagation();
        }}
        onMouseUpCapture={(e) => {
          e.nativeEvent.stopImmediatePropagation();
          e.nativeEvent.stopPropagation();
        }}
      >
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2">
            Delete?
          </Typography>
          <Typography sx={{ mt: 2 }}>
            Are you sure you would like to delete {filesToDelete} chunk{filesToDelete > 1 ? 's' : ''}?
          </Typography>
          <Typography sx={{ mt: 2 }}>
            This action is not reversible! Make sure you back up your save folder before proceeding!
          </Typography>
          <Button color='error' variant="contained" sx={{ mt: 2 }} onClick={() => {
            if (!selection) {
              setIsModalOpen(false);
              console.error('');
              return;
            }

            const [newMapData, done] = deleteMapData(mapData, selection, isSelectionInverted);

            done.then((error) => {
              if (!error) {
                setMapData(newMapData);
              } else {
                console.error('Something went wrong! ' + error);
              }
            })

            setIsModalOpen(false);
          }}>Delete forever!</Button>
          <Button style={{ marginLeft: 16 }} sx={{ mt: 2 }} onClick={() => {
            setIsModalOpen(false);
          }}>Cancel</Button>
        </Box>
      </Modal>
    </ThemeProvider>
  )
}

export default App
