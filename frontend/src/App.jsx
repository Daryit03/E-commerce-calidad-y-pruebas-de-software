import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ScrollArriba from './components/layout/ScrollArriba';
import BotonWhatsapp from './components/ui/BotonWhatsapp';
import Home from './pages/Home';
import Catalogo from './pages/Catalogo';
import ProductoDetalle from './pages/ProductoDetalle';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Perfil from './pages/Perfil';
import RecuperarCuenta from './pages/RecuperarCuenta';
import ProtectedRoute from './routes/ProtectedRoute';
import Carrito from './pages/Carrito';
import Checkout from './pages/Checkout';
import CompraExitosa from './pages/CompraExitosa';
import MisPedidos from './pages/MisPedidos';
import PedidoDetalle from './pages/PedidoDetalle';
import AdminRoute from './routes/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import AdminInicio from './pages/admin/AdminInicio';
import GestionClasificacion from './pages/admin/GestionClasificacion';
import GestionProductos from './pages/admin/GestionProductos';
import FormProducto from './pages/admin/FormProducto';
import GestionPedidos from './pages/admin/GestionPedidos';
import PedidoAdmin from './pages/admin/PedidoAdmin';
import GestionClientes from './pages/admin/GestionClientes';
import ClienteAdmin from './pages/admin/ClienteAdmin';
import NoEncontrado from './pages/NoEncontrado';
import VerificarCorreo from './pages/VerificarCorreo';
import Nosotros from './pages/Nosotros';

export default function App() {
  return (
    <>
      <ScrollArriba />
      <Navbar />
      <main className="contenedor">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/nosotros" element={<Nosotros />} />
          <Route path="/producto/:id" element={<ProductoDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/recuperar" element={<RecuperarCuenta />} />
          <Route path="/verificar-correo" element={<VerificarCorreo />} />
          <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
          <Route path="/carrito" element={<ProtectedRoute><Carrito /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/compra-exitosa" element={<ProtectedRoute><CompraExitosa /></ProtectedRoute>} />
          <Route path="/mis-pedidos" element={<ProtectedRoute><MisPedidos /></ProtectedRoute>} />
          <Route path="/mis-pedidos/:id" element={<ProtectedRoute><PedidoDetalle /></ProtectedRoute>} />

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminInicio />} />
            <Route path="clasificacion" element={<GestionClasificacion />} />
            <Route path="productos" element={<GestionProductos />} />
            <Route path="productos/nuevo" element={<FormProducto />} />
              <Route path="productos/:id" element={<FormProducto key="editar" />} />
              <Route path="pedidos" element={<GestionPedidos />} />
              <Route path="pedidos/:id" element={<PedidoAdmin />} />
              <Route path="clientes" element={<GestionClientes />} />
              <Route path="clientes/:id" element={<ClienteAdmin />} />
            <Route path="*" element={<NoEncontrado enlace="/admin" textoEnlace="Volver al panel" />} />
          </Route>
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </main>
      <Footer />
      <BotonWhatsapp />
    </>
  );
}