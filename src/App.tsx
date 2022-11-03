import './App.css';

import { useState } from 'react';

import { MapDisplay, Menu, Support } from './components';
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal';

export const App: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
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
