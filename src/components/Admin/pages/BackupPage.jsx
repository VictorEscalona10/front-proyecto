import React, { useState, useEffect } from 'react';
import styles from './BackupPage.module.css';

// Usamos la variable de entorno para la URL
const API_URL = import.meta.env.VITE_API_URL;

export const BackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Cargar la lista de respaldos al montar el componente
  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // Ajusta esto si guardas el token diferente
      
      const response = await fetch(`${API_URL}/backup/list`, {
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Asumiendo que el backend devuelve un arreglo de objetos o strings
        setBackups(data);
      } else {
        console.error('Error al obtener respaldos');
      }
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!window.confirm('¿Estás seguro de que deseas crear un nuevo respaldo de la base de datos?')) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/backup`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        alert('Respaldo creado exitosamente');
        fetchBackups(); // Recargar la lista
      } else {
        alert('Error al crear el respaldo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al intentar crear el respaldo');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreBackup = async (fileName) => {
    if (!window.confirm(`⚠️ ADVERTENCIA: ¿Estás seguro de restaurar el respaldo "${fileName}"? Esto sobrescribirá los datos actuales de la base de datos.`)) return;
    
    try {
      setActionLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/backup/restore/${fileName}`, {
        method: 'POST',
        headers: {
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        }
      });

      if (response.ok) {
        alert('Base de datos restaurada exitosamente');
      } else {
        alert('Error al restaurar la base de datos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión al intentar restaurar');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={styles.backupContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Respaldos (Backups)</h1>
        <button 
          className={styles.btnCreate} 
          onClick={handleCreateBackup}
          disabled={actionLoading}
        >
          {actionLoading ? 'Procesando...' : '+ Crear Nuevo Respaldo'}
        </button>
      </div>

      <div className={styles.tableContainer}>
        {loading ? (
          <div className={styles.loading}>Cargando respaldos...</div>
        ) : backups.length === 0 ? (
          <div className={styles.empty}>No hay respaldos disponibles.</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre del Archivo</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {backups.map((backup, index) => {
                // Dependiendo de cómo devuelva los datos tu Supabase Service (puede ser un string o un objeto con prop 'name')
                const fileName = typeof backup === 'string' ? backup : backup.name;
                
                return (
                  <tr key={index}>
                    <td>{fileName}</td>
                    <td>
                      <button 
                        className={styles.btnRestore}
                        onClick={() => handleRestoreBackup(fileName)}
                        disabled={actionLoading}
                      >
                        Restaurar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};