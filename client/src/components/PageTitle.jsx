import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const PageTitle = () => {
    const location = useLocation();

    useEffect(() => {
        const path = location.pathname;
        let title = 'SyncPane';

        if (path.startsWith('/dashboard')) {
            title = 'Dashboard | SyncPane';
        } else if (path.startsWith('/browse')) {
            title = 'Browser | SyncPane';
        } else if (path.startsWith('/jobs')) {
            title = 'Jobs | SyncPane';
        } else if (path.startsWith('/settings')) {
            title = 'Settings | SyncPane';
        }

        document.title = title;
    }, [location]);

    return null;
};

export default PageTitle;
