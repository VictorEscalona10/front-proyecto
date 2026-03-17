import React, { useState, useEffect } from 'react';
import styles from './BackupPage.module.css';

const API_URL = import.meta.env.VITE_API_URL;

export const BackupPage = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/backup/list`, {
        method: 'GET',
        credentials: 'include', // <-- Clave para enviar la cookie
      });

      if (response.ok) {
        const data = await response.json();
        setBackups(data);
      } else {
        console.error('Error al obtener respaldos. Estado:', response.status);
      }
    } catch (error) {
      console.error('Error de red:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    if (!window.confirm('¿Estás seguro de que deseas crear un nuevo respaldo?')) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/backup`, {
        method: 'POST',
        credentials: 'include', // <-- Clave para enviar la cookie
      });

      if (response.ok) {
        alert('Respaldo creado exitosamente');
        fetchBackups();
      } else {
        alert(`Error al crear el respaldo (Código: ${response.status})`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRestoreBackup = async (fileName) => {
    if (!window.confirm(`⚠️ ADVERTENCIA: ¿Restaurar "${fileName}"? Se sobrescribirán los datos actuales.`)) return;
    
    try {
      setActionLoading(true);
      const response = await fetch(`${API_URL}/backup/restore/${fileName}`, {
        method: 'POST',
        credentials: 'include', // <-- Clave para enviar la cookie
      });

      if (response.ok) {
        alert('Base de datos restaurada exitosamente');
      } else {
        alert(`Error al restaurar (Código: ${response.status})`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error de conexión');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className={styles.backupContainer}>
      <div className={styles.header}>
        <h1 className={styles.title}>Gestión de Respaldos</h1>
        <button 
          className={styles.btnCreate} 
          onClick={handleCreateBackup}
          disabled={actionLoading}
        >
          {actionLoading ? 'Procesando...' : '+ Crear Nuevo Respaldo'}
        </button>
      </div>

      <div className={styles.listContainer}>
        {loading ? (
          <div className={styles.message}>Cargando respaldos...</div>
        ) : backups.length === 0 ? (
          <div className={styles.message}>No hay respaldos disponibles.</div>
        ) : (
          <>
            <div className={styles.listHeader}>
              <div className={styles.colName}>Nombre del Archivo</div>
              <div className={styles.colActions}>Acciones</div>
            </div>
            <div className={styles.listBody}>
              {backups.map((backup, index) => {
                const fileName = typeof backup === 'string' ? backup : backup.name;
                
                return (
                  <div key={index} className={styles.listItem}>
                    <div className={styles.colName}>{fileName}</div>
                    <div className={styles.colActions}>
                      <button 
                        className={styles.btnRestore}
                        onClick={() => handleRestoreBackup(fileName)}
                        disabled={actionLoading}
                      >
                        Restaurar
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};