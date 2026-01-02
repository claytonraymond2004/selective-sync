import { NavLink } from 'react-router-dom';
import { Home, FolderSearch, Settings, Activity, CloudLightning, Sliders } from 'lucide-react';

export default function Layout({ children }) {
    const navItems = [
        { to: '/dashboard', label: 'Dashboard', icon: Home },
        { to: '/browse', label: 'Remote Browser', icon: FolderSearch },
        { to: '/jobs', label: 'Job Monitor', icon: Activity },
        { to: '/settings', label: 'Settings', icon: Sliders },
    ];

    return (
        <div className="app-container">
            <aside className="sidebar">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px 24px' }}>
                    <div style={{ padding: 8, background: 'var(--primary)', borderRadius: 8 }}>
                        <CloudLightning color="white" size={24} />
                    </div>
                    <h1 style={{ fontSize: '1.2rem', fontWeight: 800 }}>SyncWave</h1>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {navItems.map(({ to, label, icon: Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </NavLink>
                    ))}
                </nav>
            </aside>
            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
