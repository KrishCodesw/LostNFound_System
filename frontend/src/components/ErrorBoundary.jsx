import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center text-red-600 bg-red-50 rounded-lg">
          <h2 className="text-xl font-bold">Something went wrong.</h2>
          <p className="mt-2">
            Please try again later or contact support if the problem persists.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
