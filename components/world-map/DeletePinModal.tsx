"use client"

type DeletePinModalProps = {
  open: boolean
  pinTitle: string
  onCancel: () => void
  onConfirm: () => void
}

export function DeletePinModal({ open, pinTitle, onCancel, onConfirm }: DeletePinModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-5 shadow-xl backdrop-blur">
        <h3 className="text-lg font-semibold">Delete pin?</h3>
        <p className="mt-2 text-sm text-white/70">
          This will permanently remove <span className="font-medium text-white">{pinTitle}</span> from the map.
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="rounded-full border border-rose-400/30 bg-rose-500/10 px-4 py-2 text-sm text-rose-100 hover:bg-rose-500/20 transition"
            onClick={onConfirm}
          >
            Delete & Save
          </button>
        </div>
      </div>
    </div>
  )
}

