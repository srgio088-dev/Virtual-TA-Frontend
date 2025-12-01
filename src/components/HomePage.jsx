// src/components/HomePage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";


export default function Home() {
  const navigate = useNavigate();


  return (
    <div style={styles.container}>
      {/* Title and Logo Side by Side */}
      <div style={styles.topHeader}>
        <h1 style={styles.title}>Welcome to the Virtual Teaching Assitant!</h1>
        <img
          src="/images/robot.png"
          alt=""
          style={styles.image}
        />
      </div>


      {/* Simplified Description */}
      <p style={styles.description}>
        Managing multiple classes, assignments, and deadlines can be overwhelming for professors.
        Virtual TA helps by centralizing course data and assisting with feedback and grading—while keeping the professor in control.
        <br /><br />
        Our goal is to save professors time, reduce stress, and allow them to focus more on teaching and engaging with students, rather than administrative tasks.
      </p>


      {/* Navigation Section */}
      <div style={styles.header}>
        <h2 style={styles.subtitle}>Navigate to:</h2>
      </div>


      {/* Buttons that navigate */}
      <div style={styles.linksContainer}>
        <button style={styles.button} onClick={() => navigate("/assignments")}>
          View Assignments
        </button>


        <button style={styles.button} onClick={() => navigate("/upload")}>
          Upload Student Submission
        </button>


        <button style={styles.button} onClick={() => navigate("/create")}>
          Create New Assignment
        </button>
      </div>


      {/* Footer / Credits */}
      <footer style={styles.footer}>
        <p style={styles.footerText}>
          Virtual TA was created by <strong>Jed Cooper</strong>, <strong>Alexa Davis</strong>,
          <strong> Alexia Dickinson</strong>, and <strong>Sergio Giron </strong>
          for their IS Project course with <strong>Dr. Kaleta</strong> in Fall 2025.
        </p>
      </footer>
    </div>
  );
}


const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: "90vh",
    textAlign: "center",
    padding: "20px",
    backgroundImage: "url('/images/Linn_Cove.webp')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
  topHeader: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    marginBottom: "20px",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "bold",
  },
  image: {
    width: "50px",
    height: "50px",
    borderRadius: "8px",
  },
  description: {
    fontSize: "1.1rem",
    maxWidth: "700px",
    lineHeight: "1.5",
    marginBottom: "40px",
  },
  header: {
    marginBottom: "15px",
  },
  subtitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
  },
  linksContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "40px",
    alignItems: "center",
    width: "100%",
    maxWidth: "420px",
  },
  button: {
  width: "100%",
  padding: "12px 18px",
  fontSize: "1rem",
  fontWeight: "600",
  color: "#000000", // Black text
  backgroundColor: "#FFD700", // Bright yellow
  border: "2px solid #000000", // Optional black border for contrast
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background-color 0.3s ease, transform 0.2s ease",
},
  footer: {
    marginTop: "auto",
    paddingTop: "20px",
    borderTop: "1px solid #ccc",
    width: "100%",
  },
  footerText: {
    fontSize: "0.9rem",
    color: "#555",
  },
};



