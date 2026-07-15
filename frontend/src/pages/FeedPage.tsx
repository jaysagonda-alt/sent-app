import { useAuthStore } from "../store/authStore";

export default function FeedPage() {
  const { user, logout } = useAuthStore();

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Sent Feed</h1>
        <button onClick={logout} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer" }}>
          Logout
        </button>
      </div>
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "20px" }}>
        <h2>Welcome, {user?.name}!</h2>
        <p>Email: {user?.email}</p>
      </div>
      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px" }}>
        <h3>Feed Coming Soon</h3>
        <p>Posts, messages, and connections will appear here.</p>
      </div>
    </div>
  );
}
