import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  listarCategoriasAdmin, listarMarcasAdmin, obtenerProductoAdmin,
  crearProducto, actualizarProducto, subirImagenes,
} from '../../services/admin.service';
import { mensajeError } from '../../services/api';

const VACIO = {
  nombre: '', descripcion: '', idCategoria: '', idSubcategoria: '', idMarca: '',
  precio: '', stock: '', estado: true, destacado: false, ficha: [], imagenes: [],
};
const TIPOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGENES = 6;
const MAX_MB = 5;

export default function FormProducto() {
  const { id } = useParams();
  const esNuevo = !id;
  const navigate = useNavigate();

  const [p, setP] = useState(esNuevo ? VACIO : null);
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [errorCarga, setErrorCarga] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);

  useEffect(() => {
    Promise.all([listarCategoriasAdmin(), listarMarcasAdmin(), esNuevo ? null : obtenerProductoAdmin(id)])
      .then(([cats, mars, prod]) => {
        setCategorias(cats);
        setMarcas(mars);
        if (prod) {
          setP({
            ...prod,
            descripcion: prod.descripcion ?? '',
            idCategoria: String(prod.idCategoria),
            idSubcategoria: String(prod.idSubcategoria),
            idMarca: String(prod.idMarca),
            precio: prod.precio.toFixed(2),
            stock: String(prod.stock),
          });
        }
      })
      .catch((e) => setErrorCarga(e.response?.status === 404 ? 'El producto no existe.' : mensajeError(e, 'No se pudo cargar.')));
  }, [id, esNuevo]);

  if (errorCarga) return <p className="mensaje-error">{errorCarga}</p>;
  if (!p) return <p>Cargando...</p>;

  const subcategorias = categorias.find((c) => String(c.id) === p.idCategoria)?.subcategorias ?? [];

  function cambiar(campo, valor) {
    setP((x) => ({ ...x, [campo]: valor }));
    setErrores((e) => ({ ...e, [campo]: undefined }));
  }

  // ----- Ficha técnica -----
  const cambiarFicha = (i, campo, valor) => {
    setP((x) => ({ ...x, ficha: x.ficha.map((c, j) => (j === i ? { ...c, [campo]: valor } : c)) }));
    setErrores((e) => ({ ...e, ficha: undefined }));
  };
  const agregarFila = () => setP((x) => ({ ...x, ficha: [...x.ficha, { nombre: '', valor: '' }] }));
  const quitarFila = (i) => setP((x) => ({ ...x, ficha: x.ficha.filter((_, j) => j !== i) }));

  // ----- Imágenes -----
  async function elegirArchivos(e) {
    const archivos = Array.from(e.target.files || []);
    e.target.value = ''; // permite volver a elegir el mismo archivo
    if (!archivos.length) return;

    if (p.imagenes.length + archivos.length > MAX_IMAGENES)
      return setErrores((er) => ({ ...er, imagenes: `Máximo ${MAX_IMAGENES} imágenes por producto` }));
    const invalido = archivos.find((a) => !TIPOS.includes(a.type) || a.size > MAX_MB * 1024 * 1024);
    if (invalido)
      return setErrores((er) => ({ ...er, imagenes: `"${invalido.name}" no es válido: solo JPG, PNG o WEBP de hasta ${MAX_MB} MB` }));

    setSubiendo(true);
    setErrores((er) => ({ ...er, imagenes: undefined }));
    try {
      const r = await subirImagenes(archivos);
      setP((x) => {
        const todas = [...x.imagenes, ...r.imagenes.map((i) => ({ ...i, esPrincipal: false }))];
        if (!todas.some((i) => i.esPrincipal)) todas[0] = { ...todas[0], esPrincipal: true };
        return { ...x, imagenes: todas };
      });
    } catch (err) {
      setErrores((er) => ({ ...er, imagenes: mensajeError(err, 'No se pudieron subir las imágenes.') }));
    } finally {
      setSubiendo(false);
    }
  }

  const marcarPrincipal = (i) =>
    setP((x) => ({ ...x, imagenes: x.imagenes.map((img, j) => ({ ...img, esPrincipal: j === i })) }));

  const quitarImagen = (i) =>
    setP((x) => {
      const resto = x.imagenes.filter((_, j) => j !== i);
      if (resto.length && !resto.some((r) => r.esPrincipal)) resto[0] = { ...resto[0], esPrincipal: true };
      return { ...x, imagenes: resto };
    });

  // ----- Guardar -----
  function validar() {
    const er = {};
    if (p.nombre.trim().length < 3) er.nombre = 'Ingresa el nombre (mínimo 3 caracteres)';
    if (!p.idSubcategoria) er.idSubcategoria = 'Elige una subcategoría';
    if (!p.idMarca) er.idMarca = 'Elige una marca';
    if (!/^\d{1,8}(\.\d{1,2})?$/.test(String(p.precio).trim()) || Number(p.precio) <= 0)
      er.precio = 'Ingresa un precio mayor a 0 (máximo 2 decimales)';
    if (!/^\d+$/.test(String(p.stock).trim())) er.stock = 'Ingresa una cantidad entera (0 o más)';
    if (p.ficha.some((c) => !c.nombre.trim() || !c.valor.trim()))
      er.ficha = 'Completa o elimina las filas vacías de la ficha técnica';
    return er;
  }

  async function guardar(e) {
    e.preventDefault();
    setErrorGeneral('');
    const er = validar();
    setErrores(er);
    if (Object.keys(er).length) {
      setErrorGeneral('Revisa los campos marcados en rojo.');
      return window.scrollTo(0, 0);
    }

    const datos = {
      nombre: p.nombre,
      descripcion: p.descripcion,
      idSubcategoria: Number(p.idSubcategoria),
      idMarca: Number(p.idMarca),
      precio: String(p.precio).trim(),
      stock: Number(p.stock),
      estado: p.estado,
      destacado: p.destacado,
      ficha: p.ficha,
      imagenes: p.imagenes,
    };

    setGuardando(true);
    try {
      const r = esNuevo ? await crearProducto(datos) : await actualizarProducto(id, datos);
      navigate('/admin/productos', { state: { aviso: r.mensaje } });
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setErrorGeneral(mensajeError(err, 'No se pudo guardar el producto.'));
      setGuardando(false);
      window.scrollTo(0, 0);
    }
  }

  const claseError = (campo) => (errores[campo] ? 'input-error' : '');

  return (
    <div>
      <p className="migas"><Link to="/admin/productos">Productos</Link> / {esNuevo ? 'Nuevo producto' : p.nombre}</p>
      <div className="seccion-cabecera">
        <h1>{esNuevo ? 'Nuevo producto' : 'Editar producto'}</h1>
        {!esNuevo && <a className="btn-link" href={`/producto/${id}`} target="_blank" rel="noreferrer">Ver en la tienda ↗</a>}
      </div>
      {errorGeneral && <p className="mensaje-error">{errorGeneral}</p>}

      <form className="auth-form form-producto" onSubmit={guardar} noValidate>
        {/* DATOS BÁSICOS */}
        <section className="caja">
          <h2>Datos del producto</h2>
          <label>
            Nombre *
            <input value={p.nombre} maxLength={150} className={claseError('nombre')}
              onChange={(e) => cambiar('nombre', e.target.value)} placeholder="Ej.: Taladro percutor 650 W" />
            {errores.nombre && <span className="campo-error">{errores.nombre}</span>}
          </label>
          <label>
            Descripción
            <textarea rows={3} value={p.descripcion} maxLength={500} className={claseError('descripcion')}
              onChange={(e) => cambiar('descripcion', e.target.value)} placeholder="Para qué sirve, usos, ventajas..." />
            {errores.descripcion && <span className="campo-error">{errores.descripcion}</span>}
          </label>
          <div className="form-grid tres">
            <label>
              Categoría *
              <select value={p.idCategoria} onChange={(e) => { cambiar('idCategoria', e.target.value); cambiar('idSubcategoria', ''); }}>
                <option value="">Elige...</option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre}{c.estado ? '' : ' (inactiva)'}</option>
                ))}
              </select>
            </label>
            <label>
              Subcategoría *
              <select value={p.idSubcategoria} disabled={!p.idCategoria} className={claseError('idSubcategoria')}
                onChange={(e) => cambiar('idSubcategoria', e.target.value)}>
                <option value="">{p.idCategoria ? 'Elige...' : 'Primero la categoría'}</option>
                {subcategorias.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}{s.estado ? '' : ' (inactiva)'}</option>
                ))}
              </select>
              {errores.idSubcategoria && <span className="campo-error">{errores.idSubcategoria}</span>}
            </label>
            <label>
              Marca *
              <select value={p.idMarca} className={claseError('idMarca')} onChange={(e) => cambiar('idMarca', e.target.value)}>
                <option value="">Elige...</option>
                {marcas.map((m) => (
                  <option key={m.id} value={m.id}>{m.nombre}{m.estado ? '' : ' (inactiva)'}</option>
                ))}
              </select>
              {errores.idMarca && <span className="campo-error">{errores.idMarca}</span>}
            </label>
          </div>
        </section>

        {/* PRECIO Y STOCK */}
        <section className="caja">
          <h2>Precio y disponibilidad</h2>
          <div className="form-grid">
            <label>
              Precio (S/) *
              <input type="number" min="0" step="0.01" value={p.precio} className={claseError('precio')}
                onChange={(e) => cambiar('precio', e.target.value)} placeholder="0.00" />
              {errores.precio && <span className="campo-error">{errores.precio}</span>}
            </label>
            <label>
              Stock (unidades disponibles) *
              <input type="number" min="0" step="1" value={p.stock} className={claseError('stock')}
                onChange={(e) => cambiar('stock', e.target.value)} placeholder="0" />
              {errores.stock && <span className="campo-error">{errores.stock}</span>}
            </label>
          </div>
        </section>

        {/* IMÁGENES */}
        <section className="caja">
          <h2>Imágenes <span className="texto-gris nota">({p.imagenes.length}/{MAX_IMAGENES})</span></h2>
          <div className="galeria-admin">
            {p.imagenes.map((img, i) => (
              <div key={img.url} className={`foto-admin ${img.esPrincipal ? 'principal' : ''}`}>
                <img src={img.url} alt="" />
                <button type="button" className="foto-quitar" onClick={() => quitarImagen(i)} aria-label="Quitar">✕</button>
                {img.esPrincipal ? (
                  <span className="foto-etiqueta">★ Principal</span>
                ) : (
                  <button type="button" className="foto-etiqueta boton" onClick={() => marcarPrincipal(i)}>Hacer principal</button>
                )}
              </div>
            ))}
            {p.imagenes.length < MAX_IMAGENES && (
              <label className={`foto-subir ${subiendo ? 'subiendo' : ''}`}>
                {subiendo ? 'Subiendo...' : '+ Agregar fotos'}
                <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={subiendo} onChange={elegirArchivos} />
              </label>
            )}
          </div>
          <p className="texto-gris nota">JPG, PNG o WEBP de hasta {MAX_MB} MB. La foto ★ principal es la que se ve en el catálogo.</p>
          {errores.imagenes && <span className="campo-error">{errores.imagenes}</span>}
        </section>

        {/* FICHA TÉCNICA */}
        <section className="caja">
          <div className="seccion-cabecera">
            <h2>Ficha técnica</h2>
            <button type="button" className="btn btn-chico btn-secundario" onClick={agregarFila}>+ Agregar característica</button>
          </div>
          {p.ficha.length === 0 && <p className="texto-gris">Sin características. Ej.: Potencia → 650 W, Material → Acero.</p>}
          {p.ficha.map((c, i) => (
            <div key={i} className="fila-ficha">
              <input placeholder="Característica (ej.: Potencia)" maxLength={80} value={c.nombre}
                onChange={(e) => cambiarFicha(i, 'nombre', e.target.value)} />
              <input placeholder="Valor (ej.: 650 W)" maxLength={150} value={c.valor}
                onChange={(e) => cambiarFicha(i, 'valor', e.target.value)} />
              <button type="button" className="btn-link texto-peligro" onClick={() => quitarFila(i)} aria-label="Quitar">✕</button>
            </div>
          ))}
          {errores.ficha && <span className="campo-error">{errores.ficha}</span>}
        </section>

        {/* PUBLICACIÓN */}
        <section className="caja">
          <h2>Publicación</h2>
          <label className="check">
            <input type="checkbox" checked={p.estado} onChange={(e) => cambiar('estado', e.target.checked)} />
            Publicado (visible en la tienda)
          </label>
          <label className="check">
            <input type="checkbox" checked={p.destacado} onChange={(e) => cambiar('destacado', e.target.checked)} />
            ★ Destacado (aparece en la página de inicio)
          </label>
        </section>

        <div className="modal-botones">
          <Link to="/admin/productos" className="btn btn-secundario">Cancelar</Link>
          <button className="btn" disabled={guardando || subiendo}>
            {guardando ? 'Guardando...' : esNuevo ? 'Registrar producto' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  );
}