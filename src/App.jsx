// src/App.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

import AssignmentList from "./components/AssignmentList";
import UploadForm from "./components/UploadForm";
import ReviewSubmission from "./components/ReviewSubmission";
import AssignmentSubmissions from "./components/AssignmentSubmissions";
import CreateAssignment from "./components/CreateAssignment";
import HomePage from "./components/HomePage";
import EditAssignment from "./components/EditAssignment";
import RubricPage from "./components/RubricPage.jsx";
import PinEntry from "./components/PinEntry";
import PinSubmit from "./components/PinSubmit";
import PinSetup from "./components/PinSetup";

import netlifyIdentity from "netlify-identity-widget";

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // ----- Init Netlify Identity -----
    netlifyIdentity.init({
      APIUrl: "https://virtualteacher.netlify.app/.netlify/identity",
    });

    // If user already logged in (page refresh), restore it
    const current = netlifyIdentity.currentUser();
    if (current) {
      setUser(current);
      localStorage.setItem("virtualtaUserEmail", current.email || "");
      current.jwt().then((token) => {
        localStorage.setItem("virtualtaToken", token || "");
      });
    }

    // ----- Event handlers -----
    const onLogin = (u) => {
      setUser(u);
      localStorage.setItem("virtualtaUserEmail", u.email || "");
      // store JWT so frontend can send it if needed
      u.jwt().then((token) => {
        localStorage.setItem("virtualtaToken", token || "");
      });
      netlifyIdentity.close();
    };

    const onLogout = () => {
      setUser(null);
      localStorage.removeItem("virtualtaUserEmail");
      localStorage.removeItem("virtualtaToken");
    };

    netlifyIdentity.on("login", onLogin);
    netlifyIdentity.on("logout", onLogout);

    // Cleanup
    return () => {
      netlifyIdentity.off("login", onLogin);
      netlifyIdentity.off("logout", onLogout);
    };
  }, []);

  return (
    <div className="layout">
      <header className="header" style={styles.header}>
        {/* Left side: logo + header link */}
        <div style={styles.leftContainer}>
          <img src="/images/asu_logo.png" alt="ASU Logo" style={styles.logo} />
          <Link to="/home" style={styles.left}>
            Virtual TA
          </Link>
        </div>

        {/* Right side: nav links + identity */}
        <div style={styles.right}>
          <Link to="/assignments" style={styles.link}>
            View Assignments
          </Link>
          <Link to="/upload" style={styles.link}>
            Upload Submission
          </Link>
          <Link to="/create" style={styles.link}>
            Create Assignment
          </Link>

          {user ? (
            <>
              <span style={{ color: "#FFD700" }}>
                Hi, {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={() => netlifyIdentity.logout()}
                style={buttonStyle}
              >
                Log Out
              </button>
            </>
          ) : (
            <button
              onClick={() => netlifyIdentity.open("login")}
              style={buttonStyle}
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </header>

      <main className="main">
        <Routes>
          {/* Default route goes to Home */}
          <Route path="/" element={<HomePage />} />
          <Route path="/home" element={<HomePage />} />

          <Route path="/assignments" element={<AssignmentList />} />
          <Route path="/upload" element={<UploadForm />} />
          <Route path="/assignment/:id" element={<AssignmentSubmissions />} />
          <Route path="/review/:id" element={<ReviewSubmission />} />
          <Route path="/create" element={<CreateAssignment />} />
          <Route path="/edit/:id" element={<EditAssignment />} />
          <Route path="/assignment/:id/rubric" element={<RubricPage />} />

          {/* PIN-based student submission */}
          <Route path="/submit" element={<PinEntry />} />
          <Route path="/submit/:pin" element={<PinSubmit />} />
          <Route path="/pin-setup/:id" element={<PinSetup />} />
        </Routes>
      </main>
    </div>
  );
}

const buttonStyle = {
  marginLeft: "10px",
  padding: "5px 10px",
  backgroundColor: "#FFD700",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    backgroundColor: "#000000",
    borderBottom: "1px solid #ddd",
    fontFamily: "Arial, sans-serif",
  },
  leftContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  logo: {
    height: "40px",
  },
  left: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#FFD700",
    textDecoration: "none",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  link: {
    textDecoration: "none",
    fontWeight: "500",
    color: "#FFD700",
  },
};
