interface Props {
  tit: string;
  kò: string;
  onFèmen: () => void;
}

export default function PushToast({ tit, kò, onFèmen }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        top: 12,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        width: "calc(100% - 32px)",
        maxWidth: 440,
        background: "var(--surface-raised)",
        border: "1px solid var(--urgent)",
        borderRadius: 14,
        padding: "12px 14px",
        boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
      }}
      onClick={onFèmen}
    >
      <span style={{ fontSize: 20 }}>🔔</span>
      <div style={{ flex: 1 }}>
        <strong style={{ fontSize: 13.5 }}>{tit}</strong>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 2 }}>{kò}</div>
      </div>
      <span style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1 }}>✕</span>
    </div>
  );
}
