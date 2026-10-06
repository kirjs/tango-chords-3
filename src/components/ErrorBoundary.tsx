import { Component, type ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children: ReactNode;
}

// Keeps one unreadable song from blanking the whole app.
export default class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error("Render error:", error);
  }

  render() {
    if (this.state.error) {
      return (
        <p className="status error">
          This page couldn't be shown: {this.state.error.message}.{" "}
          <Link to="/" onClick={() => this.setState({ error: null })}>
            Back to all songs
          </Link>
        </p>
      );
    }
    return this.props.children;
  }
}
