import { useNotifications } from "../context/NotificationContext.jsx";
import apiClient from "../services/apiClient.js";
import NotificationItem from "./NotificationItem.jsx";

export default function NotificationDropdown({ onClose }) {
  const { state, dispatch } = useNotifications();
  const unreadNotifications = state.notifications.filter((item) => !item.isRead);

  async function handleMarkAllRead() {
    if (unreadNotifications.length === 0) return;

    dispatch({ type: "MARK_ALL_READ" });
    const results = await Promise.allSettled(
      unreadNotifications.map((item) =>
        apiClient.patch(`/api/notifications/${item.id}/read`)
      )
    );
    const failures = results.filter((result) => result.status === "rejected");

    if (failures.length > 0) {
      failures.forEach((failure) =>
        console.error("[NotificationDropdown] mark-all-read error:", failure.reason)
      );
      try {
        const response = await apiClient.get("/api/notifications");
        dispatch({ type: "LOAD_NOTIFICATIONS", payload: response.data });
      } catch (error) {
        console.error("[NotificationDropdown] notification refresh error:", error);
      }
    }
  }

  return (
    <div
      aria-label="Notifications"
      style={{
        position: "absolute",
        top: "calc(100% + 0.75rem)",
        right: 0,
        zIndex: 10,
        width: "min(22rem, calc(100vw - 2rem))",
        maxHeight: "min(28rem, calc(100vh - 6rem))",
        overflowY: "auto",
        background: "#fff",
        color: "#0f172a",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        boxShadow: "0 12px 30px rgb(15 23 42 / 18%)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.85rem 1rem",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <strong>Notifications</strong>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={unreadNotifications.length === 0}
          style={{
            border: 0,
            background: "none",
            color: unreadNotifications.length === 0 ? "#94a3b8" : "#4f46e5",
            cursor: unreadNotifications.length === 0 ? "default" : "pointer",
            fontSize: "0.8rem",
          }}
        >
          Mark all as read
        </button>
      </div>
      {state.notifications.length === 0 ? (
        <p style={{ margin: 0, padding: "1rem", color: "#64748b", fontSize: "0.9rem" }}>
          You’re all caught up.
        </p>
      ) : (
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {state.notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationItem notification={notification} onSelect={onClose} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
