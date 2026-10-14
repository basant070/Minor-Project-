export default function Section({ title, action, children }) {
  return (
    <section>
      <div className="flex flex-wrap items-center gap-2.5 justify-between mb-2">
        <h2>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
