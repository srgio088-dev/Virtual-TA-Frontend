import { Routes, Route, Link } from "react-router-dom";
import AssignmentList from "./components/AssignmentList";
import UploadForm from "./components/UploadForm";
import ReviewSubmission from "./components/ReviewSubmission";
import AssignmentSubmissions from "./components/AssignmentSubmissions";
import CreateAssignment from "./components/CreateAssignment";
import HomePage from "./components/HomePage"; 
import EditAssignment from "./components/EditAssignment"; //NEW EDIT
import netlifyIdentity from "netlify-identity-widget";
import { useEffect, useState } from "react";
import RubricPage from "./components/RubricPage.jsx";
import PinEntry from "./components/PinEntry";
import PinSubmit from "./components/PinSubmit"; //New Edit 11-30


export default function App() {
  const [user, setUser] = useState(null);

useEffect(() => {
  netlifyIdentity.init({
    APIUrl: "https://virtualteacher.netlify.app/.netlify/identity", // your site URL
  });

  netlifyIdentity.on("login", (user) => {
    setUser(user);
    netlifyIdentity.close();
  });

  netlifyIdentity.on("logout", () => {
    setUser(null);
  });

  // Optional: return cleanup
  return () => {
    netlifyIdentity.off("login");
    netlifyIdentity.off("logout");
  };
}, []);
  return (
    <div className="layout">
      <header className="header" style={styles.header}>
        {/* Left side: logo + header link */}
        <div style={styles.leftContainer}>
        <img src="/images/asu_logo.png" alt="ASU Logo" style={styles.logo} />
        <Link to="/home" style={styles.left}>Virtual TA</Link>
      </div>


        {/* Right side: nav links */}
<div style={styles.right}>
  <Link to="/assignments" style={styles.link}>View Assignments</Link>
  <Link to="/upload" style={styles.link}>Upload Submission</Link>
  <Link to="/create" style={styles.link}>Create Assignment</Link>

  {user ? (
    <>
      <span style={{ color: "#FFD700" }}>Hi, {user.user_metadata?.full_name || user.email}</span>
      <button
        onClick={() => netlifyIdentity.logout()}
        style={{
          marginLeft: "10px",
          padding: "5px 10px",
          backgroundColor: "#FFD700",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Log Out
      </button>
    </>
  ) : (
    <button
      onClick={() => netlifyIdentity.open("login")}
      style={{
        marginLeft: "10px",
        padding: "5px 10px",
        backgroundColor: "#FFD700",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer",
      }}
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
          <Route path="/edit/:id" element={<EditAssignment />} /> {/*NEW EDIT*/}
          <Route path="/assignment/:id/rubric" element={<RubricPage />} />

          {/* 🔐 PIN-based student submission */}
          <Route path="/submit" element={<PinEntry />} />
          <Route path="/submit/:pin" element={<PinSubmit />} />
        </Routes>
      </main>
    </div>
  );
}


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
    height: "40px", // adjust size as needed
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
