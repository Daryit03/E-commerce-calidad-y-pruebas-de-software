import { useCallback, useEffect, useState } from 'react';
import {
  listarCategoriasAdmin, listarMarcasAdmin,
  crearClasificacion, editarClasificacion, cambiarEstadoClasificacion,
} from '../../services/admin.service';
import { mensajeError } from '../../services/api';
import Modal from '../../components/ui/Modal';
import Campo from '../../components/ui/Campo';

const TITULOS = { categoria: 'categoría', subcategoria: 'subcategoría', marca: 'marca' };

export default function GestionClasificacion() {
  const [categorias, setCategorias] = useState(null);
  const [marcas, setMarcas] = useState(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState({ tipo: '', texto: '' });
  const [formulario, setFormulario] = useState(null); // { tipo, item?, idCategoria?, nombreCategoria? }
  const [abiertas, setAbiertas] = useState({});

  const cargar = useCallback(() => {
    return Promise.all([listarCategoriasAdmin(), listarMarcasAdmin()])
      .then(([c, m]) => { setCategorias(c); setMarcas(m); })
      .catch((e) => setError(mensajeError(e, 'No se pudieron cargar los datos.')));
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  async function alternarEstado(tipo, item) {
    if (item.estado && !window.confirm(
      `¿Desactivar "${item.nombre}"?\nSus productos NO se eliminan, solo dejarán de mostrarse en la tienda.`
    )) return;
    try {
      const r = await cambiarEstadoClasificacion(tipo, item.id, !item.estado);
      setAviso({ tipo: 'exito', texto: r.mensaje });
      cargar();
    } catch (e) {
      setAviso({ tipo: 'error', texto: mensajeError(e, 'No se pudo cambiar el estado.') });
    }
  }

  function alGuardar(mensaje) {
    setFormulario(null);
    setAviso({ tipo: 'exito', texto: mensaje });
    cargar();
  }

  if (error) return <p className="mensaje-error">{error}</p>;
  if (!categorias || !marcas) return <p>Cargando...</p>;

  return (
    <div>
      <h1>Categorías, subcategorías y marcas</h1>
      {aviso.texto && <p className={aviso.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>{aviso.texto}</p>}

      <div className="clasif-grid">
        {/* CATEGORÍAS */}
        <section className="caja">
          <div className="seccion-cabecera">
            <h2>Categorías</h2>
            <button className="btn btn-chico" onClick={() => setFormulario({ tipo: 'categoria' })}>+ Nueva categoría</button>
          </div>
          <ul className="lista-clasif">
            {categorias.map((c) => (
              <li key={c.id}>
                <Fila
                  item={c}
                  onEditar={() => setFormulario({ tipo: 'categoria', item: c })}
                  onEstado={() => alternarEstado('categoria', c)}
                  extra={
                    <button className="btn-link" onClick={() => setAbiertas((a) => ({ ...a, [c.id]: !a[c.id] }))}>
                      {abiertas[c.id] ? '▾' : '▸'} {c.subcategorias.length} subcategoría(s)
                    </button>
                  }
                />
                {abiertas[c.id] && (
                  <ul className="sublista">
                    {c.subcategorias.map((s) => (
                      <li key={s.id}>
                        <Fila
                          item={s}
                          onEditar={() => setFormulario({ tipo: 'subcategoria', item: s })}
                          onEstado={() => alternarEstado('subcategoria', s)}
                        />
                      </li>
                    ))}
                    <li>
                      <button className="btn-link"
                        onClick={() => setFormulario({ tipo: 'subcategoria', idCategoria: c.id, nombreCategoria: c.nombre })}>
                        + Agregar subcategoría a {c.nombre}
                      </button>
                    </li>
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </section>

        {/* MARCAS */}
        <section className="caja">
          <div className="seccion-cabecera">
            <h2>Marcas</h2>
            <button className="btn btn-chico" onClick={() => setFormulario({ tipo: 'marca' })}>+ Nueva marca</button>
          </div>
          <ul className="lista-clasif">
            {marcas.map((m) => (
              <li key={m.id}>
                <Fila
                  item={m}
                  onEditar={() => setFormulario({ tipo: 'marca', item: m })}
                  onEstado={() => alternarEstado('marca', m)}
                />
              </li>
            ))}
          </ul>
        </section>
      </div>

      {formulario && (
        <FormClasificacion {...formulario} onCerrar={() => setFormulario(null)} onGuardado={alGuardar} />
      )}
    </div>
  );
}

function Fila({ item, onEditar, onEstado, extra }) {
  return (
    <div className={`fila-clasif ${item.estado ? '' : 'inactiva'}`}>
      <div className="fila-clasif-info">
        <b>{item.nombre}</b>
        {item.descripcion && <span className="texto-gris">{item.descripcion}</span>}
        <span className="texto-gris nota">{item.totalProductos} producto(s)</span>
        {extra}
      </div>
      <span className={`badge-estado ${item.estado ? 'estado-ok' : 'estado-mal'}`}>
        {item.estado ? 'Activa' : 'Inactiva'}
      </span>
      <div className="fila-clasif-acciones">
        <button className="btn-link" onClick={onEditar}>Editar</button>
        <button className="btn-link" onClick={onEstado}>{item.estado ? 'Desactivar' : 'Activar'}</button>
      </div>
    </div>
  );
}

function FormClasificacion({ tipo, item, idCategoria, nombreCategoria, onCerrar, onGuardado }) {
  const [nombre, setNombre] = useState(item?.nombre ?? '');
  const [descripcion, setDescripcion] = useState(item?.descripcion ?? '');
  const [errores, setErrores] = useState({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [guardando, setGuardando] = useState(false);

  async function guardar(e) {
    e.preventDefault();
    setErrorGeneral('');
    const er = {};
    if (nombre.trim().length < 2) er.nombre = 'Ingresa un nombre (mínimo 2 caracteres)';
    setErrores(er);
    if (Object.keys(er).length) return;

    setGuardando(true);
    try {
      const datos = { nombre, descripcion };
      const r = item
        ? await editarClasificacion(tipo, item.id, datos)
        : await crearClasificacion(tipo, { ...datos, idCategoria });
      onGuardado(r.mensaje);
    } catch (err) {
      setErrores(err.response?.data?.errores || {});
      setErrorGeneral(mensajeError(err, 'No se pudo guardar.'));
      setGuardando(false);
    }
  }

  return (
    <Modal titulo={`${item ? 'Editar' : 'Nueva'} ${TITULOS[tipo]}`} onCerrar={onCerrar}>
      <form className="auth-form modal-form" onSubmit={guardar} noValidate>
        {tipo === 'subcategoria' && !item && <p className="texto-gris">Categoría: <b>{nombreCategoria}</b></p>}
        {errorGeneral && <p className="mensaje-error">{errorGeneral}</p>}
        <Campo label="Nombre" value={nombre} maxLength={100} autoFocus error={errores.nombre}
          onChange={(e) => { setNombre(e.target.value); setErrores({}); }} />
        <Campo label="Descripción (opcional)" value={descripcion} maxLength={250} error={errores.descripcion}
          onChange={(e) => setDescripcion(e.target.value)} />
        <div className="modal-botones">
          <button type="button" className="btn btn-secundario" onClick={onCerrar}>Cancelar</button>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando...' : 'Guardar'}</button>
        </div>
      </form>
    </Modal>
  );
}