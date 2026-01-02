"use client"

import type { WorldMapPin } from "@/lib/worldMapPins"

type SaveState = "idle" | "saving" | "saved" | "error"

type PinEditorPanelProps = {
  open: boolean
  isAdmin: boolean
  isEditing: boolean
  canEdit: boolean
  createMode: boolean
  saveState: SaveState
  cameraScale: number
  selectedPin: WorldMapPin | null
  categories: string[]
  slugsForCategory: Array<{ slug: string; title: string }>
  onToggleCreateMode: () => void
  onRequestDelete: () => void
  onSave: () => void
  onSetPin: (id: string, patch: Partial<WorldMapPin>) => void
  message: string | null
  error: string | null
}

export function PinEditorPanel({
  open,
  isAdmin,
  isEditing,
  canEdit,
  createMode,
  saveState,
  cameraScale,
  selectedPin,
  categories,
  slugsForCategory,
  onToggleCreateMode,
  onRequestDelete,
  onSave,
  onSetPin,
  message,
  error,
}: PinEditorPanelProps) {
  if (!open) return null

  return (
    <div className="absolute bottom-6 right-6 top-6 z-30 w-[min(420px,90vw)] overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-xl backdrop-blur">
      <div className="h-full overflow-auto p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Pins</h2>
          <div className="text-xs text-white/60">Zoom: {(cameraScale * 100).toFixed(0)}%</div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
            onClick={onToggleCreateMode}
            disabled={!canEdit}
          >
            {createMode ? "Cancel create" : "Create pin"}
          </button>
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
            onClick={onRequestDelete}
            disabled={!canEdit || !selectedPin}
          >
            Delete
          </button>
          <button
            type="button"
            className="rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm hover:bg-white/10 transition disabled:opacity-50"
            onClick={onSave}
            disabled={!canEdit || saveState === "saving"}
          >
            Save
          </button>
        </div>

        <div className="mt-4">
          {selectedPin ? (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/60">Title</label>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25 disabled:opacity-60"
                  value={selectedPin.title}
                  disabled={!canEdit}
                  onChange={(e) => onSetPin(selectedPin.id, { title: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs text-white/60">Subtitle</label>
                <input
                  className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25 disabled:opacity-60"
                  value={selectedPin.subtitle ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => onSetPin(selectedPin.id, { subtitle: e.target.value || undefined })}
                />
              </div>

              <div>
                <label className="block text-xs text-white/60">Description</label>
                <textarea
                  className="mt-1 w-full resize-none rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25 disabled:opacity-60"
                  rows={4}
                  value={selectedPin.description ?? ""}
                  disabled={!canEdit}
                  onChange={(e) => onSetPin(selectedPin.id, { description: e.target.value || undefined })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-white/60">MDX Category</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25 disabled:opacity-60"
                    value={selectedPin.mdxCategory ?? ""}
                    disabled={!canEdit}
                    onChange={(e) => {
                      const nextCategory = e.target.value || undefined
                      onSetPin(selectedPin.id, { mdxCategory: nextCategory, mdxSlug: undefined })
                    }}
                  >
                    <option value="">(none)</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-white/60">MDX Slug</label>
                  <select
                    className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25 disabled:opacity-60"
                    value={selectedPin.mdxSlug ?? ""}
                    disabled={!canEdit || !selectedPin.mdxCategory}
                    onChange={(e) => onSetPin(selectedPin.id, { mdxSlug: e.target.value || undefined })}
                  >
                    <option value="">(none)</option>
                    {slugsForCategory.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/70">
                {canEdit ? "Drag the pin to reposition. " : "Coordinates: "}
                {(selectedPin.x * 100).toFixed(2)}%, {(selectedPin.y * 100).toFixed(2)}%
              </div>
            </div>
          ) : (
            <p className="text-sm text-white/60">Select a pin to view details.</p>
          )}
        </div>

        {message ? <div className="mt-4 text-sm text-white/70">{message}</div> : null}
        {error ? <div className="mt-2 text-sm text-red-200">{error}</div> : null}
      </div>
    </div>
  )
}
