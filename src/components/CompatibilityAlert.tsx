import { Alert, Link } from '@mui/material';
import React, { useEffect, useState } from 'react';

export const CompatibilityAlert: React.FC = () => {
    const [showError, setShowError] = useState(false);
    useEffect(() => {
        const isSupported = !!window.showDirectoryPicker;
        setShowError(!isSupported);
    }, []);
    if (!showError) {
        return null;
    }
    return (
        <Alert severity="error">
            This tool requires browser support for <code>window.showDirectoryPicker</code>.{' '}
            <Link href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker#browser_compatibility">
                Check compatibility on MDN
            </Link>
        </Alert>
    );
};
