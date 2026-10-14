const hue = (name) =>
  ([...name].reduce((total, character) => total + character.charCodeAt(0), 0) *
    7) %
  360;

export default function Avatar({ name, style }) {
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  return (
    <div
      className="grid h-11 w-11 flex-none place-items-center rounded-full font-extrabold text-white"
      style={{ background: `hsl(${hue(name)} 55% 42%)`, ...style }}
    >
      {initials}
    </div>
  );
}
