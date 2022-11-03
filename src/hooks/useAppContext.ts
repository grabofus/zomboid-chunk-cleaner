import { useContext } from 'react';

import { AppContext } from '../contexts';

export const useAppContext = () => {
    return useContext(AppContext);
};
