import { useState, useEffect } from "react";
import styles from "./Home.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/AuthContext";

// Importamos los componentes y estilos de intro.js
import { Steps } from "intro.js-react";
import "intro.js/introjs.css";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  // Estado para saber si el tour está activo
  const [stepsEnabled, setStepsEnabled] = useState(false);

  // Configuración de los pasos del tour
  const [steps] = useState([
    {
      element: "#tour-welcome",
      intro:
        "¡Hola! 👋 Bienvenido a Migdalis Tortas. Te daremos un pequeño tour rápido para que conozcas la página.",
      position: "bottom",
    },
    {
      element: "#tour-cta",
      intro:
        "Aquí puedes ir a ver nuestro catálogo completo de productos. ¡Tenemos de todo para endulzar tu día!",
      position: "bottom",
    },
    {
      element: "#tour-featured",
      intro:
        "También puedes ver nuestros postres más destacados y pedirlos directamente desde aquí.",
      position: "top",
    },
  ]);

  useEffect(() => {
    if (isAuthenticated && user) {
      const hasSeenTutorial = localStorage.getItem(`tutorialSeen_${user.id}`);

      if (!hasSeenTutorial) {
        setTimeout(() => {
          setStepsEnabled(true);
        }, 800);
      }
    }
  }, [isAuthenticated, user]);

  const onExit = () => {
    setStepsEnabled(false);
    if (user) {
      localStorage.setItem(`tutorialSeen_${user.id}`, "true");
    }
  };

  // NUEVA FUNCIÓN: Vuelve a activar el tour manualmente
  const handleReplayTour = () => {
    setStepsEnabled(true);
  };

  const featuredProducts = [
    {
      id: 1,
      name: "Torta de Chocolate Suprema",
      description: "Deliciosa torta de chocolate con relleno de ganache y cubierta de buttercream.",
      emoji: "🎂",
      category: "tortas",
    },
    {
      id: 2,
      name: "Cupcakes de Vainilla",
      description: "Esponjosos cupcakes de vainilla con decoración colorida y cremosa.",
      emoji: "🧁",
      category: "ponques",
    },
    {
      id: 3,
      name: "Galletas Personalizadas",
      description: "Galletas decoradas a mano con diseños únicos y sabores exquisitos.",
      emoji: "🍪",
      category: "galletas",
    },
  ];

  const handleViewProducts = () => {
    navigate("/products");
  };

  const handleProductInterest = (category) => {
    navigate("/products", {
      state: { scrollToCategory: category },
    });
  };

  return (
    <div className={styles.homeContainer}>
      <Steps
        enabled={stepsEnabled}
        steps={steps}
        initialStep={0} // Nota: en Intro.js los índices suelen empezar en 0, te sugiero cambiar tu '1' a '0' para que no se salte el primer paso
        onExit={onExit}
        options={{
          doneLabel: "¡Entendido!",
          nextLabel: "Siguiente",
          prevLabel: "Atrás",
          skipLabel: "Saltar",
          showProgress: true,
          showBullets: false,
          overlayOpacity: 0.6,
          scrollToElement: true,
        }}
      />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <h1 id="tour-welcome" className={styles.homeTitle}>
          ¡Bienvenido a la Repostería "Migdalis Tortas"!
          <span className={styles.cupcakeIcon}>🧁</span>
        </h1>
        <p className={styles.homeSubtitle}>
          Donde cada bocado es un momento de felicidad
        </p>
        <p className={styles.welcomeMessage}>
          Descubre nuestros exquisitos pasteles y postres caseros, elaborados
          con los mejores ingredientes y mucho amor. <br />
          Cada creación es una obra de arte dulce que endulzará tus momentos
          especiales.
        </p>
        
        {/* Contenedor para agrupar los botones y que se vean mejor */}
        <div className={styles.heroButtons}>
          <button
            id="tour-cta"
            className={styles.ctaButton}
            onClick={handleViewProducts}
          >
            Ver Nuestros Productos
          </button>

          {/* NUEVO BOTÓN: Se muestra solo si el usuario está autenticado */}
          {isAuthenticated && (
            <button 
              className={styles.replayTourButton} 
              onClick={handleReplayTour}
            >
              🔄 Ver Guía de la Página
            </button>
          )}
        </div>
      </section>

      {/* Featured Products Section */}
      <section className={styles.featuredSection}>
        <h2 id="tour-featured" className={styles.sectionTitle}>
          Postres Destacados
        </h2>
        <div className={styles.productsGrid}>
          {featuredProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImage}>{product.emoji}</div>
              <div className={styles.productInfo}>
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productDescription}>
                  {product.description}
                </p>
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
            Repostería Artesanal "Migdalis Tortas" - Endulzando tus momentos
            especiales
          </p>
          <p className={styles.copyright}>
            © {new Date().getFullYear()} Migdalis Tortas. Todos los derechos
            reservados.
          </p>
          <p className={styles.copyright}>
            Diseñado con 💜 para los amantes de la repostería
          </p>
        </div>
      </footer>
    </div>
  );
}