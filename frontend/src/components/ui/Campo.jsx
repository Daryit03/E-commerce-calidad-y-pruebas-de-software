export default function Campo({ label, error, ...props }) {
  return (
    <label>
      {label}
      <input {...props} className={error ? 'input-error' : ''} />
      {error && <span className="campo-error">{error}</span>}
    </label>
  );
}