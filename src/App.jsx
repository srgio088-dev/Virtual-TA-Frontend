import { Routes, Route, Link } from "react-router-dom";
import AssignmentList from "./components/AssignmentList";
import UploadForm from "./components/UploadForm";
import ReviewSubmission from "./components/ReviewSubmission";
import AssignmentSubmissions from "./components/AssignmentSubmissions";
import CreateAssignment from "./components/CreateAssignment";
import HomePage from "./components/HomePage"; //NEW


export default function App() {
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
          {/*<span style={styles.separator}>|</span>*/}
          <Link to="/assignments" style={styles.link}>View Assignments</Link>
          <Link to="/upload" style={styles.link}>Upload Submission</Link>
          <Link to="/create" style={styles.link}>Create Assignment</Link>
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
          <Route path="/edit" element={<EditAssignment />} />
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
