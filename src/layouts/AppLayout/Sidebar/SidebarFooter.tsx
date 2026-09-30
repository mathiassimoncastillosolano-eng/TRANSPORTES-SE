interface SidebarFooterProps {
  collapsed: boolean
}

/** Pie del Sidebar: solo identifica el producto y la versión del MVP. */
export function SidebarFooter({ collapsed }: SidebarFooterProps) {
  if (collapsed) return null

  return (
    <div className="shrink-0 border-t border-ink-800 px-5 py-3">
      <p className="text-[11px] text-ink-400">RutaLibre SE · MVP Sprint 3 + 4</p>
    </div>
  )
}
