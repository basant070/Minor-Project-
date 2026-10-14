import { useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";

export default function Messages({ chat, setChat, uni }) {
  const [text, setText] = useState("");
  const box = useRef(null);
  const timer = useRef(null);

  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [chat]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const send = () => {
    const v = text.trim();
    if (!v) return;
    setChat((c) => [...c, [v, 1]]);
    setText("");
    timer.current = setTimeout(
      () =>
        setChat((c) => [...c, ["Sounds good, let’s set a time this week.", 0]]),
      700,
    );
  };

  return (
    <>
      <h2>Messages</h2>
      <div className="rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]">
        <div className="flex flex-wrap items-center gap-2.5">
          <Avatar name="Aarav Joshi" />
          <div>
            <b>Aarav Joshi</b> <span className="inline-block rounded-full bg-soft px-[9px] py-0.5 text-xs font-bold !bg-okb !text-ok">Alumni</span>
            <div className="text-[13px] text-mut">Online · {uni}</div>
          </div>
        </div>
        <div className="flex h-[280px] flex-col gap-2 overflow-auto p-1.5" ref={box}>
          {chat.map((c, i) => (
            <div key={i} className={`max-w-[75%] rounded-[14px] bg-bg px-3 py-2 ${c[1] ? "self-end bg-pri text-white" : ""}`}>
              {c[0]}
            </div>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2.5 flex-nowrap">
          <input
            placeholder="Write a message"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110" onClick={send}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}
