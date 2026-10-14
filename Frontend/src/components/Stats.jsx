export default function Stats({ items }) {
  return (
    <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(150px,1fr))]">
      {items.map(([label, value]) => (
        <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]" key={label}>
          <b className="block text-[28px]">{value}</b>
          <span className="text-[13px] text-mut">{label}</span>
        </div>
      ))}
    </div>
  );
}
