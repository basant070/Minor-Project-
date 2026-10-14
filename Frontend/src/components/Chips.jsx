export default function Chips({ items }) {
  return items.map((s) => (
    <span className="mr-[3px] inline-block rounded-lg border border-ln bg-bg px-[9px] py-0.5 text-xs [margin-block:2px]" key={s}>
      {s}
    </span>
  ));
}
