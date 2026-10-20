import { useNotifications } from "../context/NotificationContext.jsx";
import apiClient from "../services/apiClient.js";

export default function NotificationItem({ notification, onSelect }) {
  const { dispatch } = useNotifications();

  async function handleClick() {
    if (notification.isRead) return;

    dispatch({ type: "MARK_READ", payload: notification.id });
    onSelect?.();
    try {
      await apiClient.patch(`/api/notifications/${notification.id}/read`);
    } catch (error) {
      console.error("[NotificationItem] mark-as-read error:", error);
      try {
        const response = await apiClient.get("/api/notifications");
        dispatch({ type: "LOAD_NOTIFICATIONS", payload: response.data });
      } catch (refreshError) {
        console.error("[NotificationItem] notification refresh error:", refreshError);
      }
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={notification.isRead}
      aria-label={`${notification.message}${notification.isRead ? ", read" : ", unread"}`}
      style={{
        display: "block",
        width: "100%",
        padding: "0.85rem 1rem",
        border: 0,
        borderBottom: "1px solid #f1f5f9",
        background: notification.isRead ? "#fff" : "#eef2ff",
        color: "#1e293b",
        textAlign: "left",
        cursor: notification.isRead ? "default" : "pointer",
        opacity: notification.isRead ? 0.8 : 1,
      }}
    >
      <span style={{ display: "block", fontWeight: notification.isRead ? 400 : 600 }}>
        {notification.message}
      </span>
      <time
        dateTime={notification.createdAt}
        style={{ display: "block", marginTop: "0.25rem", color: "#64748b", fontSize: "0.75rem" }}
      >
        {new Date(notification.createdAt).toLocaleString()}
      </time>
    </button>
  );
}
