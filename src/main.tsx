import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './App';
import { AppContainer } from './containers';

import './index.css';

const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        background: {
            default: '#000'
        }
    }
});

ReactDOM.render(
    <React.StrictMode>
        <AppContainer>
            <ThemeProvider theme={darkTheme}>
                <>
                    <CssBaseline />
                    <App />
                </>
            </ThemeProvider>
        </AppContainer>
    </React.StrictMode>,
    document.getElementById('root')
);
