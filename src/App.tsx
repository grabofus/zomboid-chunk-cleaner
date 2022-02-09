import './App.css';

import { Box, Button, createTheme, CssBaseline, Grid, Modal, Paper, ThemeProvider, Typography } from '@mui/material';
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

function deleteMapData(mapData: Coordinate[], region: Region): [mapData: Coordinate[], done: Promise<string>] {
  const fileList = mapData.filter((point) => isPointInRegion(point, region)).map(({x, y}) => `map_${x}_${y}.bin`);
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
  return [mapData.filter((point) => !isPointInRegion(point, region)), promise];
}

function isPointInRegion(point: Coordinate, region: Region): boolean {
  const [from, to] = region;
  return from.x <= point.x && point.x <= to.x && from.y <= point.y && point.y <= to.y;
}

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const zoomLevel = 1;

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
  const [mapData, setMapData] = useState<Coordinate[]>([]);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);
  const selectionCanvasRef = useRef<HTMLCanvasElement>(null);

  // Redraw map when data changes
  useEffect(() => {
    const mapCanvas = mapCanvasRef.current;
    const selectionCanvas = selectionCanvasRef.current;
    if (!mapCanvas || !selectionCanvas) return;

    const context = mapCanvas.getContext('2d');
    if (!context) return;

    let maxX = 1;
    let maxY = 1;

    for (const { x, y } of mapData) {
      maxX = Math.max(x, maxX);
      maxY = Math.max(y, maxY);
    }

    selectionCanvas.width = mapCanvas.width = maxX * zoomLevel;
    selectionCanvas.height = mapCanvas.height = maxY * zoomLevel;

    context.fillStyle = 'hsla(41, 30%, 61%, 1)';
    context.fillRect(0, 0, maxX * zoomLevel, maxY * zoomLevel);

    for (const point of mapData) {
      context.fillStyle = (!selection || isPointInRegion(point, selection)) ? '#f66' : 'hsla(41, 49%, 76%, 1)';
      context.fillRect(point.x * zoomLevel, point.y * zoomLevel, 1 * zoomLevel, 1 * zoomLevel);
    }
  }, [mapData, selection]);

  // Track mouse pos
  useEffect(() => {
    const canvas = selectionCanvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    let mousePos: Coordinate = { x: 0, y: 0 };
    let selectionStart: Coordinate | undefined;

    const getMousePosition = (e: MouseEvent): Coordinate & { isOverCanvas: boolean } => {
      const canvasRect = canvas.getBoundingClientRect();
      const x = e.clientX - Math.floor(canvasRect.left);
      const y = e.clientY - Math.floor(canvasRect.top);
      const isOverCanvas = 0 <= x && x < canvasRect.width && 0 <= y && y < canvasRect.height;
      return { x, y, isOverCanvas };
    }

    const draw = () => {
      const mouseX = mousePos.x;
      const mouseY = mousePos.y;

      context.clearRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = 'black';
      context.fillText(`X: ${mouseX} Y: ${mouseX}`, 4, 12);

      if (selectionStart) {
        const selectionX = selectionStart.x;
        const selectionY = selectionStart.y;
        context.fillStyle = '#f664';
        context.strokeStyle = '#f66c';
        context.fillRect(selectionX, selectionY, mouseX - selectionX, mouseY - selectionY);
        context.strokeRect(selectionX, selectionY, mouseX - selectionX, mouseY - selectionY);
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      mousePos = getMousePosition(e);
      draw();
    }

    const handleMouseDown = (e: MouseEvent) => {
      if (!getMousePosition(e).isOverCanvas) return;
      
      e.preventDefault();
      selectionStart = getMousePosition(e);
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
  }, []);

  const filesToDelete = useMemo(() => selection ? mapData.filter((point) => isPointInRegion(point, selection)).length : 0, [mapData, selection]);

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Grid container spacing={1} justifyContent="center" style={{ marginTop: '2rem' }}>
        <Grid item xs={8} justifyContent="space-between">
          <Button onClick={() => {
            loadMapData().then((mapData) => {
              setMapData(mapData);
            });
          }}>Load map data</Button>
          <Button color='error' disabled={filesToDelete === 0} onClick={() => setIsModalOpen(true)}>Delete {filesToDelete} chunks</Button>
        </Grid>
        <Grid item>
          <Paper style={{ padding: '1rem', display: mapData.length > 0 ? 'grid' : 'none' }}>
            <canvas ref={mapCanvasRef} style={{ gridArea: '1 / 1' }}></canvas>
            <canvas ref={selectionCanvasRef} style={{ gridArea: '1 / 1' }}></canvas>
          </Paper>
        </Grid>
      </Grid>
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

              const [newMapData, done] = deleteMapData(mapData, selection);

              done.then((error) => {
                if (!error) {
                  setMapData(newMapData);
                } else {
                  console.error('Something went wrong! ' + error);
                }
              })

              setIsModalOpen(false);
            }}>Delete forever!</Button>
        </Box>
      </Modal>
    </ThemeProvider>
  )
}

export default App
