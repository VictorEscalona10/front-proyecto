import { useState, useEffect } from "react";
import "./CategoryPage.css";

export function Category({ onShowModal }) {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchType, setSearchType] = useState("name"); // 'name' o 'id'
  const [activeTab, setActiveTab] = useState('list'); // 'list' o 'create'

  const API_URL = import.meta.env.VITE_API_URL;

  // Cargar categorías al montar el componente
  useEffect(() => {
    getCategories();
  }, []);

  // Filtrar categorías cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredCategories(categories);
    } else {
      const filtered = categories.filter(category => {
        if (searchType === 'name') {
          return category.name.toLowerCase().includes(searchTerm.toLowerCase());
        } else { // search by id
          return category.id.toString().includes(searchTerm);
        }
      });
      setFilteredCategories(filtered);
    }
  }, [searchTerm, searchType, categories]);

  const getCategories = async () => {
    setLoading(true);
    try {
      const request = await fetch(`${API_URL}/category`);
      const response = await request.json();
      setCategories(response);
      setFilteredCategories(response);
    } catch (error) {
      console.error("Error fetching categories:", error);
      onShowModal({
        type: 'error',
        message: 'Error al cargar las categorías',
      });
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (name) => {
    if (!name.trim()) {
    onShowModal({
    type: 'success',
    message: 'Categoría creada con éxito',
    autoClose: true
  });
        return;
      }

    try {
      const request = await fetch(`${API_URL}/category/create`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      });
      
      if (!request.ok) {
        throw new Error('Error al crear la categoría');
      }
      
      const response = await request.json();
      setCategories([...categories, response]);
      setNewCategory("");
      onShowModal({
        type: 'success',
        message: 'Categoría creada con éxito'
      });
    } catch (error) {
      console.error("Error creating category:", error);
      onShowModal({
        type: 'error',
        message: 'Error al crear la categoría'
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onShowModal({
      type: 'confirm',
      message: `¿Estás seguro de crear la categoría "${newCategory}"?`,
      onConfirm: () => createCategory(newCategory)
    });
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
    setSearchTerm(""); // Limpiar búsqueda al cambiar tipo
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <div className="category-page">
      <div className="category-header">
        <h1>Gestión de Categorías</h1>
        <p>Administra las categorías de productos de la repostería</p>
      </div>

      {/* Tabs de navegación */}
      <div className="tabs">
        <button 
          className={`tab-button ${activeTab === 'list' ? 'active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          Lista de Categorías
        </button>
        <button 
          className={`tab-button ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Crear Categoría
        </button>
      </div>

      {/* Panel de Lista y Búsqueda */}
      {activeTab === 'list' && (
        <div className="list-panel">
          {/* Panel de búsqueda */}
          <div className="search-panel">
            <h3>Buscar Categorías</h3>
            <div className="search-controls">
              <div className="search-type-selector">
                <label htmlFor="searchType">Buscar por:</label>
                <select 
                  id="searchType"
                  value={searchType} 
                  onChange={handleSearchTypeChange}
                  className="search-type-select"
                >
                  <option value="name">Nombre</option>
                  <option value="id">ID</option>
                </select>
              </div>
              
              <div className="search-input-group">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder={searchType === 'name' ? "Buscar por nombre..." : "Buscar por ID..."}
                  className="search-input"
                />
                {searchTerm && (
                  <button 
                    onClick={clearSearch}
                    className="clear-search-btn"
                    title="Limpiar búsqueda"
                  >
                    X
                  </button>
                )}
              </div>
            </div>
            
            <div className="search-info">
              <p>
                Mostrando {filteredCategories.length} de {categories.length} categorías
                {searchTerm && ` - Filtrado por: "${searchTerm}"`}
              </p>
            </div>
          </div>

          {/* Botón para recargar categorías */}
          <div className="category-actions">
            <button 
              onClick={getCategories} 
              className="load-btn"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Actualizar Lista"}
            </button>
          </div>

          {/* Lista de categorías */}
          <div className="categories-list">
            {loading ? (
              <div className="loading-state">
                <p>Cargando categorías...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="empty-state">
                {searchTerm ? (
                  <>
                    <p>No se encontraron categorías</p>
                    <p>No hay resultados para "{searchTerm}"</p>
                    <button onClick={clearSearch} className="load-btn">
                      Mostrar todas
                    </button>
                  </>
                ) : (
                  <>
                    <p>No hay categorías cargadas</p>
                    <p>Haz clic en "Actualizar Lista" para cargar las categorías</p>
                  </>
                )}
              </div>
            ) : (
              <>
                <h3>Categorías Existentes ({filteredCategories.length})</h3>
                <div className="categories-grid">
                  {filteredCategories.map((category) => (
                    <div key={category.id} className="category-card">
                      <div className="category-info">
                        <div className="category-id">ID: {category.id}</div>
                        <span className="category-name">{category.name}</span>
                      </div>
                      {/* TRABAJADOR: Sin botón de eliminar */}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Panel de Creación */}
      {activeTab === 'create' && (
        <div className="create-panel">
          <div className="category-form">
            <h3>Crear Nueva Categoría</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Nombre de la nueva categoría"
                  className="category-input"
                />
                <button type="submit" className="add-btn">
                  Crear Categoría
                </button>
              </div>
            </form>
            <p className="form-description">
              Las categorías se crearán en minúsculas automáticamente
            </p>
          </div>

          {/* Vista previa de categorías existentes */}
          <div className="existing-categories-preview">
            <h4>Categorías Existentes ({categories.length})</h4>
            {categories.length > 0 ? (
              <div className="categories-preview-list">
                {categories.slice(0, 5).map((category) => (
                  <div key={category.id} className="category-preview-item">
                    <span>#{category.id} - {category.name}</span>
                  </div>
                ))}
                {categories.length > 5 && (
                  <div className="preview-more">
                    ... y {categories.length - 5} más
                  </div>
                )}
              </div>
            ) : (
              <p className="no-categories">No hay categorías cargadas</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}