import { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";

interface Post {
  id: string;
  content: string;
  userId: string;
  user: { name: string; email: string };
  likes: number;
  createdAt: string;
}

export default function PostsPage() {
  const { user, logout } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch("http://localhost:3001/api/posts");
      const data = await response.json();
      if (Array.isArray(data)) {
        setPosts(data);
      } else {
        setError("Failed to load posts");
      }
    } catch (err) {
      setError("Network error loading posts");
    }
    setLoading(false);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const response = await fetch("http://localhost:3001/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setContent("");
        fetchPosts();
      }
    } catch (err) {
      setError("Failed to create post");
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await fetch(`http://localhost:3001/api/posts/${postId}/like`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${useAuthStore.getState().token}`,
        },
      });
      fetchPosts();
    } catch (err) {
      setError("Failed to like post");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1>Sent Feed</h1>
        <button onClick={logout} style={{ padding: "10px 20px", backgroundColor: "#dc3545", color: "white", border: "none", cursor: "pointer" }}>
          Logout
        </button>
      </div>

      <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "30px" }}>
        <h3>Hi {user?.name}! ??</h3>
        {error && <div style={{ color: "red", marginBottom: "15px" }}>{error}</div>}
        <form onSubmit={handleCreatePost}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your mission journey..."
            style={{ width: "100%", padding: "12px", borderRadius: "4px", border: "1px solid #ddd", marginBottom: "10px", minHeight: "100px" }}
          />
          <button
            type="submit"
            style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", cursor: "pointer", borderRadius: "4px" }}
          >
            Share Post
          </button>
        </form>
      </div>

      {loading ? (
        <p>Loading posts...</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Be the first to share!</p>
      ) : (
        posts.map((post) => (
          <div key={post.id} style={{ backgroundColor: "white", padding: "20px", borderRadius: "8px", marginBottom: "15px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <div>
                <strong>{post.user.name}</strong>
                <p style={{ color: "#666", fontSize: "14px", margin: "5px 0 0 0" }}>{post.user.email}</p>
              </div>
              <span style={{ color: "#999", fontSize: "12px" }}>{new Date(post.createdAt).toLocaleDateString()}</span>
            </div>
            <p style={{ margin: "15px 0" }}>{post.content}</p>
            <button
              onClick={() => handleLike(post.id)}
              style={{ backgroundColor: "#f0f0f0", border: "none", padding: "8px 12px", cursor: "pointer", borderRadius: "4px" }}
            >
              ?? {post.likes}
            </button>
          </div>
        ))
      )}
    </div>
  );
}
