import styles from './Products.module.css';
import { ProductsComponent } from "../ProductsComponent/ProductsComponent.jsx";
import { useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Products({ onShowModal }) {
  const location = useLocation();
  
  // Refs para cada sección de categoría
  const tortasRef = useRef(null);
  const galletasRef = useRef(null);
  const donasRef = useRef(null);
  const ponquesRef = useRef(null);
  const pasapalosDulcesRef = useRef(null);
  const pasapalosSaladosRef = useRef(null);

  // Mapeo de categorías a refs
  const categoryRefs = {
    'tortas': tortasRef,
    'galletas': galletasRef,
    'donas': donasRef,
    'ponques': ponquesRef,
    'pasapalos dulces': pasapalosDulcesRef,
    'pasapalos salados': pasapalosSaladosRef
  };

  // Función para hacer scroll suave a una categoría
  const scrollToCategory = (category) => {
    const ref = categoryRefs[category];
    if (ref && ref.current) {
      setTimeout(() => {
        ref.current.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
  };

  // Efecto para manejar el scroll automático cuando viene del home
  useEffect(() => {
    if (location.state && location.state.scrollToCategory) {
      scrollToCategory(location.state.scrollToCategory);
    }
  }, [location.state]);

  // Mapeo de emojis a categorías
  const emojiCategories = [
    { emoji: '🎂', label: 'Tortas', ref: tortasRef },
    { emoji: '🍪', label: 'Galletas', ref: galletasRef },
    { emoji: '🍩', label: 'Donas', ref: donasRef },
    { emoji: '🧁', label: 'Ponques', ref: ponquesRef },
    { emoji: '🍫', label: 'Pasapalos Dulces', ref: pasapalosDulcesRef },
    { emoji: '🥨', label: 'Pasapalos Salados', ref: pasapalosSaladosRef }
  ];

  const handleEmojiClick = (ref) => {
    if (ref && ref.current) {
      ref.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.productsContainer}>
        <h1 className={styles.productsTitle}>¡Bienvenido a la sección de Productos!</h1>
        <p className={styles.productsSubtitle}>Aquí encontrarás todos nuestros deliciosos productos</p>
        
        <div className={styles.welcomeMessage}>
          <p>Haz clic en cualquier emoji para ir directamente a esa categoría:</p>

          <div className={styles.emojiContainer}>
            {emojiCategories.map((item, index) => (
              <button
                key={index}
                className={styles.emojiButton}
                onClick={() => handleEmojiClick(item.ref)}
                title={`Ir a ${item.label}`}
                aria-label={`Ir a la categoría ${item.label}`}
              >
                {item.emoji}
              </button>
            ))}
          </div>

          <div className={styles.Productscont}>
            <h1 className={styles.productos}>Productos</h1>
            
            {/* Sección de Tortas */}
            <div ref={tortasRef} className={styles.categorySection}>
              <h2 className={styles.categoria}>Tortas</h2>
              <ProductsComponent categoria='tortas' onShowModal={onShowModal}/>
            </div>

            {/* Sección de Galletas */}
            <div ref={galletasRef} className={styles.categorySection}>
              <h2 className={styles.categoria}>Galletas</h2>
              <ProductsComponent categoria='galletas' onShowModal={onShowModal}/>
            </div>

            {/* Sección de Ponques */}
            <div ref={ponquesRef} className={styles.categorySection}>
              <h2 className={styles.categoria}>Ponques</h2>
              <ProductsComponent categoria='ponques' onShowModal={onShowModal}/>
            </div>
          </div>
        </div>
      </div>

      {/* Footer agregado aquí */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Repostería "Migdalis Tortas" - Endulzando tus momentos especiales
          </p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Migdalis Tortas. Todos los derechos reservados.
          </p>
          <p className={styles.copyright}>
            Diseñado con 💜 para los amantes de la repostería
          </p>
        </div>
      </footer>
    </div>
  );
}