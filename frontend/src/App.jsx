import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import RecuperarCuenta from './pages/RecuperarCuenta';
import RestablecerPassword from './pages/RestablecerPassword';
import ProtectedRoute from './routes/ProtectedRoute';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import CompraExitosa from './pages/CompraExitosa';

export default function App() {
  return (
    <>
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<RecuperarCuenta />} />
          <Route path="/restablecer" element={<RestablecerPassword />} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/compra-exitosa" element={<ProtectedRoute><CompraExitosa /></ProtectedRoute>} />
          <Route path="*" element={<p>Esta página aún está en construcción.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}