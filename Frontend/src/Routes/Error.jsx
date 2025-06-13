import React from "react";

export default function Error404() {
  return (
    <div style={styles.body}>
      <div style={{ ...styles.cloud, ...styles.cloud1 }}></div>
      <div style={{ ...styles.cloud, ...styles.cloud2 }}></div>

      <div style={styles.container}>
        <div style={styles.emoji}>🧸</div>
        <h1 style={styles.title}>404</h1>
        <h2 style={styles.subtitle}>Ops! Página não encontrada</h2>
        <p style={styles.text}>
          Parece que a página que você procura foi brincar em outro lugar.<br />
          Mas não se preocupe, você pode voltar para a área segura.
        </p>
        <a href="/" style={styles.button}>Voltar à Página Inicial</a>
      </div>
    </div>
  );
}

const styles = {
  body: {
    margin: 0,
    height: "100vh",
    background: "linear-gradient(to top right, #fce4ec, #e1f5fe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    position: "relative",
    color: "#444"
  },
  container: {
    padding: 30,
    maxWidth: 500,
  },
  emoji: {
    fontSize: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 100,
    margin: 0,
    color: "#f06292"
  },
  subtitle: {
    fontSize: 26,
    marginBottom: 10,
    color: "#1976d2"
  },
  text: {
    fontSize: 18,
    marginBottom: 30,
  },
  button: {
    display: "inline-block",
    textDecoration: "none",
    backgroundColor: "#4fc3f7",
    color: "white",
    padding: "12px 24px",
    borderRadius: 8,
    transition: "background-color 0.3s ease"
  },
  cloud: {
    position: "absolute",
    background: "white",
    borderRadius: "50%",
    opacity: 0.5
  },
  cloud1: {
    width: 150,
    height: 60,
    top: 60,
    left: 30
  },
  cloud2: {
    width: 100,
    height: 40,
    top: 100,
    right: 40
  }
};
