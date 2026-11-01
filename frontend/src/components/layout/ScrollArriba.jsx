import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Al cambiar de página: sube al inicio, o baja a la sección del #ancla (ej.: /#nosotros)
export default function ScrollArriba() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      // Espera a que la página dibuje la sección y luego baja hasta ella
      const t = setTimeout(() => {
        document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}