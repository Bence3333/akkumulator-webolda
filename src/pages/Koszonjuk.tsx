import React from "react";

export default function Koszonjuk() {
  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.badge}>Spark Solar • Érdeklődés rögzítve</div>
        <div style={styles.icon}>✅</div>
        <h1 style={styles.h1}>Köszönjük az érdeklődést!</h1>
        <p style={styles.p}>
          Jelzését sikeresen megkaptuk.
          <br />
          Kollégáink rövidesen felveszik Önnel a kapcsolatot, és ellenőrzik a
          pályázati jogosultságot.
        </p>

        <div style={styles.steps}>
          <b style={styles.stepsTitle}>Mi történik most</b>
          <div>1) Jogosultság gyors ellenőrzése</div>
          <div>2) Szükséges dokumentumok egyeztetése</div>
          <div>3) Regisztráció előkészítése és indulhat a közös munka</div>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    textAlign: "center",
    fontFamily: "Arial, Helvetica, sans-serif",
    color: "#fff",
    background: "linear-gradient(135deg, #1e7f4f, #2ecc71)",
  },
  card: {
    width: "100%",
    maxWidth: 580,
    padding: "42px 28px",
    borderRadius: 18,
    background: "rgba(255,255,255,0.14)",
    boxShadow: "0 22px 60px rgba(0,0,0,0.28)",
    backdropFilter: "blur(6px)",
  },
  badge: {
    display: "inline-block",
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(255,255,255,0.18)",
    fontSize: 13,
    marginBottom: 18,
  },
  icon: { fontSize: 64, lineHeight: 1, margin: "10px 0 18px" },
  h1: { margin: "0 0 12px", fontSize: 30 },
  p: { margin: "0 0 18px", fontSize: 16, lineHeight: 1.6, opacity: 0.92 },
  steps: {
    marginTop: 18,
    textAlign: "left",
    background: "rgba(255,255,255,0.16)",
    padding: 16,
    borderRadius: 14,
    fontSize: 14,
    lineHeight: 1.55,
  },
  stepsTitle: { display: "block", marginBottom: 6 },
};
