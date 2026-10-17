import { REGLAS_PASSWORD } from '../../utils/validations';

export default function ReglasPassword({ password }) {
  if (!password) return null;
  return (
    <ul className="reglas">
      {REGLAS_PASSWORD.map((r) => {
        const ok = r.cumple(password);
        return <li key={r.texto} className={ok ? 'ok' : ''}>{ok ? '✓' : '•'} {r.texto}</li>;
      })}
    </ul>
  );
}