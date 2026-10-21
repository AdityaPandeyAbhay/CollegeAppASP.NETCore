import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    try {
      localStorage.removeItem("teacherActiveDropdown");
    } catch (_) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          style={{
            margin: "30px auto",
            maxWidth: "700px",
            padding: "24px",
            backgroundColor: "#fff1f2",
            borderRadius: "10px",
            border: "1px solid #fecdd3",
            color: "#9f1239",
            fontFamily: "system-ui, -apple-system, sans-serif",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ margin: "0 0 10px 0", fontSize: "20px" }}>
            Something went wrong while rendering this section.
          </h2>
          <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#4c0519" }}>
            The application caught an unexpected error and prevented a blank screen.
          </p>
          <details
            style={{
              whiteSpace: "pre-wrap",
              backgroundColor: "#ffffff",
              padding: "12px",
              borderRadius: "6px",
              fontSize: "12.5px",
              color: "#b91c1c",
              border: "1px solid #fda4af",
              marginBottom: "16px",
              maxHeight: "200px",
              overflow: "auto",
            }}
          >
            <summary style={{ cursor: "pointer", fontWeight: "600", marginBottom: "6px" }}>
              Technical Details
            </summary>
            {this.state.error?.toString()}
            {this.state.errorInfo?.componentStack}
          </details>
          <button
            onClick={this.handleReload}
            style={{
              padding: "8px 18px",
              backgroundColor: "#e11d48",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
