import './App.css';

import { useState } from 'react';

import { CompatibilityAlert, ConfirmDeleteModal, MapDisplay, Menu, Support } from './components';

export const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <CompatibilityAlert />
            <div style={{ display: 'grid', gap: 16 }}>
                <Menu onDelete={() => setIsModalOpen(true)} />
            </div>
            <div>
                <MapDisplay />
            </div>
            <Support />
            <ConfirmDeleteModal isModalOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
};
