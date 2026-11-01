import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { obtenerCategorias, buscarProductos, obtenerMarcas } from '../services/catalogo.service';
import ProductCard from '../components/product/ProductCard';

export default function Catalogo() {
  const [params, setParams] = useSearchParams();
  const [categorias, setCategorias] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');

  // Lee los filtros actuales desde la URL
  const q = params.get('q') || '';
  const categoria = params.get('categoria') || '';
  const subcategoria = params.get('subcategoria') || '';
  const marcasSel = params.get('marca') ? params.get('marca').split(',') : [];
  const orden = params.get('orden') || 'relevancia';
  const pagina = Number(params.get('pagina') || 1);

  // Categorías del menú lateral (una sola vez)
  useEffect(() => {
    obtenerCategorias().then(setCategorias).catch(() => {});
  }, []);

  // Marcas: solo cuando hay subcategoría elegida
  useEffect(() => {
    if (!subcategoria) { setMarcas([]); return; }
    obtenerMarcas(subcategoria).then(setMarcas).catch(() => setMarcas([]));
  }, [subcategoria]);

  // Cada vez que cambia la URL, vuelve a buscar
  useEffect(() => {
    setPrecioMin(params.get('precioMin') || '');
    setPrecioMax(params.get('precioMax') || '');
    setCargando(true);
    setError('');
    buscarProductos(Object.fromEntries(params))
      .then(setResultado)
      .catch(() => setError('No pudimos cargar los productos en este momento. Revisa tu conexión a internet y vuelve a intentarlo en unos segundos.'))
      .finally(() => setCargando(false));
  }, [params]);

  // Cambia filtros en la URL (vacío = quitar). Vuelve a la página 1 salvo que se pida lo contrario.
  function actualizar(cambios, mantenerPagina = false) {
    const nuevos = new URLSearchParams(params);
    Object.entries(cambios).forEach(([k, v]) =>
      v === '' || v == null ? nuevos.delete(k) : nuevos.set(k, v)
    );
    if (!mantenerPagina) nuevos.delete('pagina');
    setParams(nuevos);
  }

  const sinFiltrosExtra = { marca: '', precioMin: '', precioMax: '' };
  const elegirCategoria = (idCat) => actualizar({ categoria: idCat, subcategoria: '', ...sinFiltrosExtra });
  const elegirSubcategoria = (idCat, idSub) => actualizar({ categoria: idCat, subcategoria: idSub, ...sinFiltrosExtra });

  function alternarMarca(idMarca) {
    const id = String(idMarca);
    const lista = marcasSel.includes(id) ? marcasSel.filter((m) => m !== id) : [...marcasSel, id];
    actualizar({ marca: lista.join(',') });
  }

  function aplicarPrecio(e) {
    e.preventDefault();
    actualizar({ precioMin, precioMax });
  }

  const limpiarFiltros = () => setParams(q ? { q } : {});

  // Título según lo que se está viendo
  const catActual = categorias.find((c) => String(c.id) === categoria);
  const subActual = catActual?.subcategorias.find((s) => String(s.id) === subcategoria);
  const titulo = q
    ? `Resultados para "${q}"`
    : subActual?.nombre || catActual?.nombre || 'Todos los productos';

  return (
    <div className="catalogo">
      <aside className="filtros caja">
        <h3>Categorías</h3>
        <button className={`filtro-link ${!categoria ? 'activo' : ''}`} onClick={() => elegirCategoria('')}>
          Todas
        </button>
        {categorias.map((c) => (
          <div key={c.id}>
            <button
              className={`filtro-link ${String(c.id) === categoria && !subcategoria ? 'activo' : ''}`}
              onClick={() => elegirCategoria(c.id)}
            >
              {c.nombre}
            </button>
            {String(c.id) === categoria &&
              c.subcategorias.map((s) => (
                <button
                  key={s.id}
                  className={`filtro-link sub ${String(s.id) === subcategoria ? 'activo' : ''}`}
                  onClick={() => elegirSubcategoria(c.id, s.id)}
                >
                  {s.nombre}
                </button>
              ))}
          </div>
        ))}

        {subcategoria ? (
          <>
            <h3>Marca</h3>
            {marcas.length === 0 && <p className="texto-gris">Sin marcas.</p>}
            {marcas.map((m) => (
              <label key={m.id} className="check">
                <input
                  type="checkbox"
                  checked={marcasSel.includes(String(m.id))}
                  onChange={() => alternarMarca(m.id)}
                />
                {m.nombre}
              </label>
            ))}

            <h3>Precio (S/)</h3>
            <form className="rango-precio" onSubmit={aplicarPrecio}>
              <input type="number" min="0" placeholder="Mín" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} />
              <input type="number" min="0" placeholder="Máx" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} />
              <button className="btn btn-chico">Aplicar</button>
            </form>
          </>
        ) : (
          <p className="texto-gris nota-filtros">Elige una subcategoría para filtrar por marca y precio.</p>
        )}

        <button className="btn btn-secundario btn-bloque" onClick={limpiarFiltros}>
          Limpiar filtros
        </button>
      </aside>

      <section>
        <div className="catalogo-cabecera">
          <div>
            <h1>{titulo}</h1>
            {resultado && <p className="texto-gris">{resultado.total} producto(s)</p>}
          </div>
          <select value={orden} onChange={(e) => actualizar({ orden: e.target.value === 'relevancia' ? '' : e.target.value })}>
            <option value="relevancia">Relevancia</option>
            <option value="precio-asc">Precio: menor a mayor</option>
            <option value="precio-desc">Precio: mayor a menor</option>
            <option value="az">Nombre: A-Z</option>
            <option value="za">Nombre: Z-A</option>
          </select>
        </div>

        {cargando && <p>Cargando productos...</p>}
        {error && <p className="mensaje-error">{error}</p>}

        {!cargando && !error && resultado?.productos.length === 0 && (
          <div className="caja vacio">
            <p>No encontramos productos con esos filtros.</p>
            <button className="btn" onClick={limpiarFiltros}>Limpiar filtros</button>
          </div>
        )}

        {!cargando && !error && resultado?.productos.length > 0 && (
          <>
            <div className="grid-productos">
              {resultado.productos.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>

            {resultado.totalPaginas > 1 && (
              <div className="paginacion">
                <button className="btn btn-secundario" disabled={pagina <= 1}
                  onClick={() => actualizar({ pagina: pagina - 1 }, true)}>← Anterior</button>
                <span>Página {pagina} de {resultado.totalPaginas}</span>
                <button className="btn btn-secundario" disabled={pagina >= resultado.totalPaginas}
                  onClick={() => actualizar({ pagina: pagina + 1 }, true)}>Siguiente →</button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}