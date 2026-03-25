import { useState, useEffect } from 'react';
import styles from './Home.module.css';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/AuthContext';
import Joyride, { STATUS } from 'react-joyride'; // Importamos la librería

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Estado de React Joyride
  const [{ run, steps }, setState] = useState({
    run: false,
    steps: [
      {
        target: 'body',
        content: '¡Hola! 👋 Bienvenido a Migdalis Tortas. Te daremos un pequeño tour rápido para que conozcas la página.',
        placement: 'center',
        disableBeacon: true, // Empieza directo sin el puntito parpadeante
      },
      {
        target: '#tour-cta',
        content: 'Aquí puedes ir a ver nuestro catálogo completo de productos. ¡Tenemos de todo!',
        placement: 'bottom',
      },
      {
        target: '#tour-featured',
        content: 'También puedes ver nuestros postres más destacados y pedirlos directamente desde aquí.',
        placement: 'top',
      }
    ]
  });

  useEffect(() => {
    // Si el usuario está logueado, revisamos si ya vio el tutorial
    if (isAuthenticated && user) {
      const hasSeenTutorial = localStorage.getItem(`tutorialSeen_${user.id}`);
      
      if (!hasSeenTutorial) {
        // Si no lo ha visto, arrancamos el tour
        setState(s => ({ ...s, run: true }));
      }
    }
  }, [isAuthenticated, user]);

  // Esta función maneja cuando el usuario termina o salta el tour
  const handleJoyrideCallback = (data) => {
    const { status } = data;
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setState({ run: false });
      if (user) {
        // Guardamos en el navegador que ya lo completó
        localStorage.setItem(`tutorialSeen_${user.id}`, 'true');
      }
    }
  };

  const featuredProducts = [
    {
      id: 1,
      name: "Torta de Chocolate Suprema",
      description: "Deliciosa torta de chocolate con relleno de ganache y cubierta de buttercream.",
      emoji: "🎂",
      category: 'tortas'
    },
    {
      id: 2,
      name: "Cupcakes de Vainilla",
      description: "Esponjosos cupcakes de vainilla con decoración colorida y cremosa.",
      emoji: "🧁",
      category: 'ponques'
    },
    {
      id: 3,
      name: "Galletas Personalizadas",
      description: "Galletas decoradas a mano con diseños únicos y sabores exquisitos.",
      emoji: "🍪",
      category: 'galletas'
    }
  ];

  const handleViewProducts = () => {
    navigate('/products');
  };

  const handleProductInterest = (category) => {
    navigate('/products', { 
      state: { scrollToCategory: category } 
    });
  };

  return (
    <div className={styles.homeContainer}>
      
      {/* Componente principal del Tour Guiado */}
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        hideCloseButton
        run={run}
        scrollToFirstStep
        showProgress
        showSkipButton
        steps={steps}
        styles={{
          options: {
            zIndex: 10000,
            primaryColor: '#8b008b', // Tu color morado
            textColor: '#510138',
          },
          buttonNext: {
            backgroundColor: '#d719da',
          },
          buttonBack: {
            marginRight: 10,
            color: '#8b008b'
          }
        }}
        locale={{
          back: 'Atrás',
          close: 'Cerrar',
          last: '¡Entendido!',
          next: 'Siguiente',
          skip: 'Saltar tour'
        }}
      />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 className={styles.homeTitle}>
          ¡Bienvenido a la Repostería "Migdalis Tortas"! 
          <span className={styles.cupcakeIcon}>🧁</span>
        </h1>
        <p className={styles.homeSubtitle}>
          Donde cada bocado es un momento de felicidad
        </p>
        <p className={styles.welcomeMessage}>
          Descubre nuestros exquisitos pasteles y postres caseros, 
          elaborados con los mejores ingredientes y mucho amor. <br /> 
          Cada creación es una obra de arte dulce que endulzará tus momentos especiales.
        </p>
        {/* Le agregamos id="tour-cta" */}
        <button id="tour-cta" className={styles.ctaButton} onClick={handleViewProducts}>
          Ver Nuestros Productos
        </button>
      </section>

      {/* Featured Products Section */}
      <section className={styles.featuredSection}>
        {/* Le agregamos id="tour-featured" */}
        <h2 id="tour-featured" className={styles.sectionTitle}>Postres Destacados</h2>
        <div className={styles.productsGrid}>
          {featuredProducts.map(product => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>
                {product.emoji}
              </div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>{product.description}</p>
                <p className={styles.productPrice}>{product.price}</p>
                <button 
                  className={styles.orderButton}
                  onClick={() => handleProductInterest(product.category)}
                >
                  ver más {product.emoji}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <p className={styles.footerText}>
            Repostería Artesanal "Migdalis Tortas" - Endulzando tus momentos especiales
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