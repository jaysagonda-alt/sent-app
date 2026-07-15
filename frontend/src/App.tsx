import { useState } from "react";
import { useAuthStore } from "./store/authStore";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import PostsPage from "./pages/PostsPage";
import MessagesPage from "./pages/MessagesPage";

export default function App() {
  const [page, setPage] = useState<"login" | "signup" | "feed" | "messages">("login");
  const { token } = useAuthStore();

  if (token) {
    return (
      <div>
        <nav style={{ display: "flex", gap: "20px", padding: "15px 20px", backgroundColor: "#f8f9fa", borderBottom: "1px solid #ddd" }}>
          <button
            onClick={() => setPage("feed")}
            style={{ background: page === "feed" ? "#007bff" : "none", color: page === "feed" ? "white" : "black", border: "none", padding: "10px 15px", cursor: "pointer", borderRadius: "4px" }}
          >
            Feed
          </button>
          <button
            onClick={() => setPage("messages")}
            style={{ background: page === "messages" ? "#007bff" : "none", color: page === "messages" ? "white" : "black", border: "none", padding: "10px 15px", cursor: "pointer", borderRadius: "4px" }}
          >
            Messages
          </button>
        </nav>
        {page === "feed" ? <PostsPage /> : <MessagesPage />}
      </div>
    );
  }

  if (page === "login") {
    return (
      <div>
        <LoginPage onLoginSuccess={() => setPage("feed")} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          Don't have an account?{" "}
          <button onClick={() => setPage("signup")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}>
            Sign up
          </button>
        </div>
      </div>
    );
  }

  if (page === "signup") {
    return (
      <div>
        <SignupPage onSignupSuccess={() => setPage("feed")} />
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          Already have an account?{" "}
          <button onClick={() => setPage("login")} style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return <div>Loading...</div>;
}
