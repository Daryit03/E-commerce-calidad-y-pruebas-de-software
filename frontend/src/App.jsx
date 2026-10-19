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
            <Route path="*" element={<p className="texto-gris">Este módulo se construirá en los siguientes pasos.</p>} />
          </Route>
          <Route path="*" element={<p>Esta página aún está en construcción.</p>} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}