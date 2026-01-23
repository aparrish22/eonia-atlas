"use client"

type NavigateModalProps = {
  open: boolean
  title: string
  loading: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function NavigateModal({ open, title, loading, onCancel, onConfirm }: NavigateModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/60 p-5 shadow-xl backdrop-blur">
        <h3 className="text-lg font-semibold">Open page?</h3>
        <p className="mt-2 text-sm text-white/70">
          Do you want to go to <span className="font-medium text-white">{title}</span>?
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
            disabled={loading}
            onClick={onCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-100 hover:bg-emerald-500/20 transition disabled:opacity-50"
            disabled={loading}
            onClick={onConfirm}
          >
            {loading ? (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-emerald-200/70 border-t-transparent" />
            ) : null}
            {loading ? "Opening…" : "Yes, open"}
          </button>
        </div>
      </div>
    </div>
  )
}

