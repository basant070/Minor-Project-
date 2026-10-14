export default function ConfirmModal({ message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-20 grid place-items-center bg-[rgba(10,10,30,0.5)] p-4">
      <div className="w-full max-w-[400px] rounded-[18px] border border-ln bg-sf p-[18px] shadow-[0_4px_18px_rgba(30,30,80,0.06)]" role="dialog" aria-modal="true">
        <h3>Confirm</h3>
        <p className="text-[13px] text-mut my-2 mb-4">{message}</p>
        <div className="flex flex-wrap items-center gap-2.5 justify-between">
          <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110 !bg-none border border-ln bg-sf !text-ink" onClick={onCancel}>
            Cancel
          </button>
          <button className="inline-flex cursor-pointer items-center justify-center rounded-xl border-0 bg-[linear-gradient(135deg,var(--pri),var(--pri2))] px-4 py-[9px] font-bold text-white transition-[filter] duration-150 hover:brightness-110" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
