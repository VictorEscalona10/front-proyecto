// AdminDashboard.jsx - Versión CORREGIDA
import { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import './AdminDashboard.css';
import { Category } from './pages/CategoryPage.jsx';
import { ProductPage } from './pages/ProductPage.jsx';
import AdminChatPage  from './pages/AdminChatPage.jsx';
import AdminCustomization from './pages/Customization';
import { OrderPage } from './pages/OrderPage.jsx';
import { Users } from './pages/UsersPage.jsx';
import { PDFTester } from './pages/PDFTester.jsx';
import StatsPage  from './pages/StatsPage.jsx';
import { BackupPage } from './pages/BackupPage.jsx';
import { AdminBotChat } from './pages/AdminBotChat.jsx';

// NUEVO: Importar useAuth
import { useAuth } from '../../hooks/useAuth.jsx';

export function AdminDashboard({ onShowModal }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // NUEVO: Extraer la función logout del contexto global
  const { logout } = useAuth(); 

  const menuItems = [
    { path: '/admin/dashboard', name: 'Dashboard', icon: '' },
    { path: '/admin/products', name: 'Productos', icon: '' },
    { path: '/admin/categories', name: 'Categorías', icon: '' },
    { path: '/admin/users', name: 'Usuarios', icon: '' },
    { path: '/admin/orders', name: 'Órdenes', icon: '' },
    { path: '/admin/stats', name: 'Estadísticas', icon: '' },
    { path: '/admin/pdf-tester', name: 'PDF Tester', icon: '' },
    { path: '/admin/backup', name: 'Respaldos', icon: '' },
    { path: '/admin/customization', name: 'Personalización', icon: '' },
    { path: '/admin/chats', name: 'Chats', icon: '' },
  ];

  // CORREGIDO: Usar la función global para limpiar la sesión en todo el frontend
  const sessionClose = async () => {
    try {
      await logout(); // Limpia el estado global de isAuthenticated y user
      navigate('/login'); // Redirige al login
    } catch (error) {
      console.error('Error cerrando sesión:', error);
    }
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Panel de administrador</h2>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="menu-icon">{item.icon}</span>
              {sidebarOpen && <span className="menu-text">{item.name}</span>}
            </Link>
          ))}
        </div>

        <div className="sidebar-footer" style={{ cursor: 'pointer' }}>
            <span className="logout-icon"></span>
            {/* CORREGIDO: Se llama a sessionClose al hacer click */}
            {sidebarOpen && <span onClick={sessionClose}>Salir</span>}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <header className="admin-header">
          <h1>Panel de Administración</h1>
          <div className="user-info">
            <span className="user-avatar"></span>
            <span className="user-name">Administrador</span>
          </div>
        </header>

        <div className="content-area">
          <Routes>
            {/* RUTAS CORREGIDAS - USANDO PATHS RELATIVOS */}
            <Route 
              index 
              element={
                <div className="dashboard-welcome">
                  <h2>Bienvenido al Panel de Administración</h2>
                  <p>Selecciona una opción del menú para comenzar.</p>
                  <AdminBotChat /> {/* AQUÍ AGREGAMOS EL CHAT */}
                </div>
              } 
            />
            <Route 
              path="dashboard" 
              element={
                <div className="dashboard-welcome">
                  <h2>Bienvenido al Panel de Administración</h2>
                  <p>Selecciona una opción del menú para comenzar.</p>
                  <AdminBotChat /> {/* AQUÍ AGREGAMOS EL CHAT */}
                </div>
              } 
            />
            <Route path="products" element={<ProductPage onShowModal={onShowModal} />} />
            <Route path="categories" element={<Category onShowModal={onShowModal} />} />
            <Route path="users" element={<Users onShowModal={onShowModal} />} />
            <Route path="customization" element={<AdminCustomization onShowModal={onShowModal} />} />
            <Route path="stats" element={<StatsPage onShowModal={onShowModal} />} />
            <Route path="orders" element={<OrderPage onShowModal={onShowModal} />} />
            <Route path="pdf-tester" element={<PDFTester onShowModal={onShowModal} />} />
            <Route path="backup" element={<BackupPage onShowModal={onShowModal} />} />
            <Route path="chats" element={<AdminChatPage onShowModal={onShowModal} />} />
            
            {/* Redirección para rutas no encontradas */}
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}