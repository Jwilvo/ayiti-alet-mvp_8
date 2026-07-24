import { useOnlineStatus, usePendingQueue } from "../hooks";
import { trySyncQueue } from "../offline";

export default function ConnectivityBanner() {
  const online = useOnlineStatus();
  const queue = usePendingQueue();

  if (online && queue.length === 0) return null;

  if (!online) {
    return (
      <div className="banner" style={{ background: "var(--surface-raised)", borderColor: "var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>📴 Ou pa gen entènèt kounye a. {queue.length > 0 ? `${queue.length} rapò ap tann.` : "Rapò ou fè yo ap estoke sou telefòn nan."}</span>
      </div>
    );
  }

  // Online but reports still queued (waiting to sync, or last sync attempt failed)
  return (
    <div className="banner banner-ok" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
      <span>🔄 {queue.length} rapò poko fin voye — n ap eseye kounye a.</span>
      <button
        className="btn btn-ghost"
        style={{ padding: "6px 10px", fontSize: 12 }}
        onClick={() => trySyncQueue()}
      >
        Eseye kounye a
      </button>
    </div>
  );
}
