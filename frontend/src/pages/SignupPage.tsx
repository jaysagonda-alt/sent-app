import { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function SignupPage({ onSignupSuccess }: { onSignupSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const response = await fetch("http://localhost:3001/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, missionOrg: "Other" }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        onSignupSuccess();
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px" }}>
      <h1>Join Sent</h1>
      {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>Name:</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} required />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Email:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} required />
        </div>
        <div style={{ marginBottom: "15px" }}>
          <label>Password:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ width: "100%", padding: "8px", marginTop: "5px" }} required />
        </div>
        <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", cursor: "pointer" }}>
          Sign Up
        </button>
      </form>
    </div>
  );
}
