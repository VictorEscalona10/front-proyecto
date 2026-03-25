import { useState, useEffect } from "react";
import "./ProductPage.css";

export function ProductPage({ onShowModal }) {
  const [products, setProducts] = useState([]);
  const [groupedProducts, setGroupedProducts] = useState({});
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    imagen: null,
  });
  const [uploadResult, setUploadResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("name");
  const [searchTerm, setSearchTerm] = useState("");
  const [availableCategories, setAvailableCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  
  // NUEVO: Estado para saber si estamos editando (guarda el ID) o creando (null)
  const [editingId, setEditingId] = useState(null); 

  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    getAllProducts();
    getAllCategories(); // Cargamos las categorías de una vez
  }, []);

  useEffect(() => {
    groupProductsByCategory();
  }, [products]);

  const getAllCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/category`);
      const result = await response.json();
      setAvailableCategories(result.data || result);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setAvailableCategories([]);
    }
  };

  const groupProductsByCategory = () => {
    const grouped = {};
    const categoryList = [];

    products.forEach((product) => {
      const categoryName = product.category?.name || "Sin Categoría";
      if (!grouped[categoryName]) {
        grouped[categoryName] = [];
        categoryList.push(categoryName);
      }
      grouped[categoryName].push(product);
    });

    setGroupedProducts(grouped);
    setCategories(categoryList.sort());
  };

  const getAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/products`);
      if (!response.ok) {
        const fallbackResponse = await fetch(`${API_URL}/products/search/name?name=`);
        const fallbackResult = await fallbackResponse.json();
        setProducts(fallbackResult.data || []);
        return;
      }
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const getProductByName = async (name) => {
    try {
      const response = await fetch(`${API_URL}/products/search/name?name=${encodeURIComponent(name)}`);
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  const getProductsByCategory = async (categoryId) => {
    try {
      const response = await fetch(`${API_URL}/products/search/category?id=${encodeURIComponent(categoryId)}`);
      const result = await response.json();
      setProducts(result.data || []);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      setProducts([]);
    }
  };

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      getAllProducts();
      return;
    }
    if (searchType === "name") {
      getProductByName(searchTerm);
    } else {
      getProductsByCategory(searchTerm);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "name") {
      const onlyLetters = value.replace(/[0-9]/g, "");
      setFormData((prev) => ({ ...prev, name: onlyLetters }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, imagen: e.target.files[0] }));
  };

  // NUEVO: Modificado para manejar tanto POST (Crear) como PUT (Editar)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    fd.append("name", formData.name);
    fd.append("description", formData.description);
    fd.append("price", formData.price);
    
    // El backend espera 'categoryName' en tu DTO. Lo buscamos de la lista de categorías
    const selectedCategory = availableCategories.find(c => String(c.id) === String(formData.categoryId));
    if (selectedCategory) {
      fd.append("categoryName", selectedCategory.name);
    }

    if (formData.imagen) {
      fd.append("imagen", formData.imagen);
    }

    // Configurar URL y método según si estamos editando o creando
    const isEditing = editingId !== null;
    const url = isEditing 
      ? `${API_URL}/products/edit/${editingId}` 
      : `${API_URL}/products/create`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        credentials: "include",
        body: fd,
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        closeModal();
        getAllProducts();

        if (onShowModal) {
          onShowModal({
            type: "success",
            message: isEditing ? "✅ Producto actualizado con éxito" : "✅ Producto creado con éxito",
            autoClose: true,
          });
        }
      } else {
        if (onShowModal) {
          onShowModal({
            type: "error",
            message: data.message || `Error al ${isEditing ? "actualizar" : "crear"} el producto`,
          });
        }
      }
    } catch (error) {
      if (onShowModal) {
        onShowModal({
          type: "error",
          message: "Error de red al procesar el producto",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearSearch = () => {
    setSearchTerm("");
    getAllProducts();
  };

  // NUEVO: Abrir modal para CREAR
  const openModal = () => {
    setEditingId(null);
    setFormData({ name: "", description: "", price: "", categoryId: "", imagen: null });
    setShowModal(true);
    if (availableCategories.length === 0) getAllCategories();
  };

  // NUEVO: Abrir modal para EDITAR
  const openEditModal = (product) => {
    setEditingId(product.id);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      categoryId: product.categoryId || "",
      imagen: null, // No precargamos la imagen en el input file
    });
    setShowModal(true);
    if (availableCategories.length === 0) getAllCategories();
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({ name: "", description: "", price: "", categoryId: "", imagen: null });
    const fileInput = document.getElementById("imagen");
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    setDeletingId(productId);
    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (response.status === 204) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        if (onShowModal) {
          onShowModal({ type: "success", message: "🗑️ Producto eliminado correctamente", autoClose: true });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al eliminar el producto");
      }
    } catch (error) {
      if (onShowModal) {
        onShowModal({ type: "error", message: error.message || "Error al eliminar el producto" });
      }
    } finally {
      setDeletingId(null);
    }
  };

  const totalProducts = products.length;

  return (
    <div className="product-page">
      <header className="page-header">
        <h1>Gestión de Productos</h1>
        <p>Busca productos por nombre o categoría</p>
      </header>

      <div className="page-content">
        <section className="search-section">
          <h2>Buscar Productos</h2>
          <div className="search-controls">
            <div className="search-type-selector">
              <button
                type="button"
                className={`type-btn ${searchType === "name" ? "active" : ""}`}
                onClick={() => setSearchType("name")}
              >
                Por Nombre
              </button>
              <button
                type="button"
                className={`type-btn ${searchType === "category" ? "active" : ""}`}
                onClick={() => setSearchType("category")}
              >
                Por Categoría
              </button>
            </div>

            <div className="search-input-group">
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder={
                    searchType === "name"
                      ? "Ejemplo: tequeños, hamburguesa, pizza..."
                      : "Ejemplo: 6 (ID de categoría)"
                  }
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                {searchTerm && (
                  <button className="clear-search-btn" onClick={clearSearch} type="button">X</button>
                )}
              </div>
              <button className="search-btn" onClick={handleSearch} disabled={!searchTerm.trim()}>
                Buscar
              </button>
            </div>
          </div>
        </section>

        <section className="results-section">
          <div className="results-header">
            <h3>
              {searchTerm
                ? `Resultados de búsqueda ${searchType === "name" ? "por nombre" : "por categoría"}`
                : "Todos los Productos"}
              {totalProducts > 0 && <span className="results-count"> ({totalProducts} productos)</span>}
            </h3>
            {totalProducts > 0 && (
              <button className="clear-results" onClick={clearSearch}>Limpiar resultados</button>
            )}
          </div>

          {totalProducts > 0 ? (
            <div className="categories-container">
              {categories.map((categoryName) => (
                <div key={categoryName} className="category-section">
                  <div className="category-header">
                    <h4 className="category-title">{categoryName}</h4>
                    <span className="category-count">{groupedProducts[categoryName].length} productos</span>
                  </div>
                  <div className="products-grid">
                    {groupedProducts[categoryName].map((product) => (
                      <div key={product.id} className="product-card">
                        <div className="product-image">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} />
                          ) : (
                            <div className="no-image">Sin imagen</div>
                          )}
                        </div>
                        <div className="product-info">
                          <h4>{product.name}</h4>
                          <p className="product-description">{product.description}</p>
                          <p className="product-price">${product.price}</p>
                          <div className="product-meta">
                            <span className="product-category">{product.category?.name}</span>
                            <span className="product-id">ID: {String(product.id).slice(0, 8)}</span>
                          </div>
                          
                          {/* NUEVO: Botones de Acción (Editar y Eliminar) */}
                          <div className="product-actions">
                            <button
                              className="edit-btn"
                              onClick={() => openEditModal(product)}
                              title="Editar producto"
                            >
                              Editar
                            </button>
                            <button
                              className={`delete-btn ${!product.isActive ? "disabled" : ""}`}
                              onClick={() => handleDeleteProduct(product.id)}
                              disabled={deletingId === product.id || !product.isActive}
                              title={!product.isActive ? "Producto ya eliminado" : "Eliminar producto"}
                            >
                              {deletingId === product.id ? "..." : !product.isActive ? "Eliminado" : "Eliminar"}
                            </button>
                          </div>
                          
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-products">
              <p>No hay productos disponibles en este momento</p>
            </div>
          )}
        </section>
      </div>

      <button className="floating-add-btn" onClick={openModal} title="Agregar nuevo producto">
        +
      </button>

      {/* Modal dinámico para Crear/Editar */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              {/* Título dinámico */}
              <h2>{editingId ? "Editar Producto" : "Agregar Nuevo Producto"}</h2>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="name">Nombre *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                    title="El nombre no puede contener números"
                    placeholder="Ingresa el nombre del producto"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="description">Descripción</label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Describe el producto"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="price">Precio *</label>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      step="0.01"
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="categoryId">Categoría *</label>
                    <select
                      id="categoryId"
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">Selecciona una categoría</option>
                      {availableCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  {/* La imagen es obligatoria al crear, opcional al editar */}
                  <label htmlFor="imagen">Imagen {editingId ? "(Opcional si no deseas cambiarla)" : "*"}</label>
                  <input
                    type="file"
                    id="imagen"
                    name="imagen"
                    onChange={handleFileChange}
                    accept="image/*"
                    required={!editingId} 
                  />
                </div>

                {/* Botón dinámico */}
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? "Enviando..." : (editingId ? "Guardar Cambios" : "Subir Producto")}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}