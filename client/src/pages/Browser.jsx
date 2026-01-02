import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Folder, FileText, ArrowLeft, Download, X } from 'lucide-react';
import ModalBackdrop from '../components/ModalBackdrop';

export default function Browser() {
    const [path, setPath] = useState('/');
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [syncLocations, setSyncLocations] = useState([]);
    const [localPath, setLocalPath] = useState('');

    const [error, setError] = useState(null);

    const [folderSizes, setFolderSizes] = useState({});

    useEffect(() => {
        fetchFiles(path);
    }, [path]);

    useEffect(() => {
        if (modalOpen) {
            fetch('http://localhost:3001/api/sync-locations').then(res => res.json()).then(setSyncLocations);
        }
    }, [modalOpen]);

    const fetchFiles = async (p) => {
        setLoading(true);
        setFiles([]); // Clear previous files
        setFolderSizes({}); // Clear previous sizes
        setError(null);
        try {
            const res = await fetch(`http://localhost:3001/api/remote/list?path=${encodeURIComponent(p)}`);
            const data = await res.json();

            if (res.ok) {
                setFiles(data);
                // Lazily fetch folder sizes
                const folders = data.filter(f => f.type === 'folder').map(f => f.path);
                if (folders.length > 0) {
                    fetchSizes(folders);
                }
            } else {
                // Handle different error types
                if (data.error === 'Missing SSH configuration') {
                    setError({
                        title: 'Configuration Required',
                        message: 'SSH Configuration is missing. Please configure your server details to continue.',
                        action: { label: 'Go to Settings', link: '/config' }
                    });
                } else if (data.error.includes('Authentication failure')) {
                    setError({
                        title: 'Authentication Failed',
                        message: 'Please check your username, password, or SSH key in Settings.',
                        action: { label: 'Go to Settings', link: '/config' }
                    });
                } else if (data.error.includes('ENOTFOUND') || data.error.includes('ETIMEDOUT')) {
                    setError({
                        title: 'Connection Failed',
                        message: 'Could not connect to server. Please check the Host/IP and Port.'
                    });
                } else {
                    setError({
                        title: 'Error',
                        message: data.error
                    });
                }
            }
        } catch (err) {
            console.error(err);
            setError({
                title: 'Network Error',
                message: 'Could not connect to the backend server. Please ensure the backend is running.'
            });
        } finally {
            setLoading(false);
        }
    };

    const fetchSizes = async (paths) => {
        try {
            const res = await fetch('http://localhost:3001/api/remote/folders/sizes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paths })
            });
            if (res.ok) {
                const sizes = await res.json();
                setFolderSizes(prev => ({ ...prev, ...sizes }));
            }
        } catch (err) {
            console.error('Error fetching sizes:', err);
        }
    };

    const handleNavigate = (newPath) => {
        setPath(newPath);
    };

    const handleUp = () => {
        if (path === '/') return;
        const parent = path.substring(0, path.lastIndexOf('/')) || '/';
        setPath(parent);
    };

    const openSyncModal = (item) => {
        setSelectedItem(item);
        setLocalPath('');
        setModalOpen(true);
    };

    const handleSync = async () => {
        if (!localPath) return;

        // If selecting a folder, we might want to append the folder name to the local path automatically? 
        // Or assume the user selects the TARGET parent?
        // Let's assume user selects the exact target path including the folder name.
        // Actually, easiest UX: User selects "Download to...", e.g., /Users/me/Downloads
        // And we append the item name: /Users/me/Downloads/FolderName
        // But for now, let's just use the Input value as the full destination path.
        // We can be smart: if the input path seems to be a common root, we append.

        let finalLocalPath = localPath;
        // Simple heuristic: if using a preset, append name
        const isPreset = syncLocations.find(l => l.path === localPath);
        if (isPreset) {
            finalLocalPath = `${localPath}/${selectedItem.name}`;
        }

        try {
            const res = await fetch('http://localhost:3001/api/sync', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    remotePath: selectedItem.path,
                    localPath: finalLocalPath,
                    type: selectedItem.type
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            setModalOpen(false);
            // Optional: show a toast or success check
        } catch (err) {
            setError({
                title: 'Sync Failed',
                message: err.message
            });
        }
    };

    const formatBytes = (bytes, decimals = 1) => {
        if (!bytes) return '-';
        if (bytes === 0) return '0 B';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    };

    return (
        <div className="animate-enter">
            {/* ... header ... */}
            <div className="header">
                <h1 className="page-title">Remote Browser</h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, color: 'var(--text-muted)' }}>
                    <button onClick={handleUp} disabled={path === '/'} style={{ opacity: path === '/' ? 0.3 : 1 }}>
                        <ArrowLeft size={16} color="white" />
                    </button>
                    <div className="breadcrumbs" style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        <button
                            onClick={() => handleNavigate('/')}
                            style={{
                                background: path === '/' ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                padding: '4px 12px',
                                borderRadius: 16,
                                fontSize: '0.85em',
                                color: 'white',
                                border: 'none',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={e => path !== '/' && (e.target.style.background = 'rgba(255,255,255,0.2)')}
                            onMouseLeave={e => path !== '/' && (e.target.style.background = 'rgba(255,255,255,0.1)')}
                        >
                            root
                        </button>
                        {path.split('/').filter(Boolean).map((segment, index, arr) => {
                            const segmentPath = '/' + arr.slice(0, index + 1).join('/');
                            const isLast = index === arr.length - 1;
                            return (
                                <button
                                    key={segmentPath}
                                    onClick={() => handleNavigate(segmentPath)}
                                    disabled={isLast}
                                    style={{
                                        background: isLast ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                        padding: '4px 12px',
                                        borderRadius: 16,
                                        fontSize: '0.85em',
                                        color: 'white',
                                        border: 'none',
                                        cursor: isLast ? 'default' : 'pointer',
                                        transition: 'all 0.2s',
                                        maxWidth: 200,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={e => !isLast && (e.target.style.background = 'rgba(255,255,255,0.2)')}
                                    onMouseLeave={e => !isLast && (e.target.style.background = 'rgba(255,255,255,0.1)')}
                                >
                                    {segment}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="card">
                {loading ? <p>Loading remote files...</p> : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: 40 }}></th>
                                    <th>Name</th>
                                    <th>Size</th>
                                    <th style={{ textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map(file => (
                                    <tr key={file.name}>
                                        <td>{file.type === 'folder' ? <Folder color="var(--primary)" size={20} /> : <FileText color="var(--text-muted)" size={20} />}</td>
                                        <td>
                                            {file.type === 'folder' ? (
                                                <button onClick={() => handleNavigate(file.path)} style={{ fontWeight: 500, color: 'var(--text-main)' }}>
                                                    {file.name}
                                                </button>
                                            ) : (
                                                <span>{file.name}</span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: '0.9em', color: 'var(--text-muted)' }}>
                                            {
                                                file.type === 'folder'
                                                    ? (folderSizes[file.path] !== undefined ? formatBytes(folderSizes[file.path]) : '-')
                                                    : formatBytes(file.size)
                                            }
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => openSyncModal(file)} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                                                <Download size={14} /> Sync
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Error Modal */}
            {error && createPortal(
                <ModalBackdrop onClose={() => setError(null)}>
                    <div className="card" style={{ width: 400, maxWidth: '90%', border: '1px solid var(--error)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                            <h3 style={{ color: 'var(--error)' }}>{error.title}</h3>
                            <button onClick={() => setError(null)}><X size={20} color="white" /></button>
                        </div>
                        <p style={{ marginBottom: 24, lineHeight: 1.6 }}>{error.message}</p>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button onClick={() => setError(null)} className="btn btn-secondary">Close</button>
                            {error.action && (
                                <button onClick={() => window.location.href = error.action.link} className="btn btn-primary">
                                    {error.action.label}
                                </button>
                            )}
                        </div>
                    </div>
                </ModalBackdrop>,
                document.body
            )}

            {/* Sync Modal */}
            {modalOpen && createPortal(
                <ModalBackdrop onClose={() => setModalOpen(false)}>
                    <div className="card" style={{ width: 500, maxWidth: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                            <h3>Sync "{selectedItem?.name}"</h3>
                            <button onClick={() => setModalOpen(false)}><X size={20} color="white" /></button>
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8 }}>Select Local Destination:</label>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                                {syncLocations.map(loc => (
                                    <button
                                        key={loc.id}
                                        onClick={() => setLocalPath(loc.path)}
                                        style={{
                                            padding: '8px 12px', borderRadius: 6,
                                            background: localPath === loc.path ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                                            color: 'white', border: 'none'
                                        }}
                                    >
                                        {loc.path}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="text"
                                value={localPath}
                                onChange={e => setLocalPath(e.target.value)}
                                placeholder="/absolute/path/to/local/folder"
                                style={{ width: '100%', padding: '12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: 'white' }}
                            />
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 8 }}>
                                Note: If you selected a preset location, the {selectedItem?.type || 'item'} "{selectedItem?.name}" will be created inside it.
                            </p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                            <button onClick={() => setModalOpen(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleSync} className="btn btn-primary">Start Sync</button>
                        </div>
                    </div>
                </ModalBackdrop>,
                document.body
            )}
        </div>
    );
}


