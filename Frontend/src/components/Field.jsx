export default function Field({ id, label, type = "text", value, onChange, ...rest }) {
  return (
    <div className="min-w-0">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...rest}
      />
    </div>
  );
}
