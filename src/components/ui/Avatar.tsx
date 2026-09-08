export default function Avatar({ init, color, size }: { init: string; color: string; size: number }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.325, fontWeight: 500, flexShrink: 0,
      letterSpacing: "0.02em",
    }}>
      {init}
    </div>
  );
}
