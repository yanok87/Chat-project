"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            className="min-h-[200px] flex flex-col items-center justify-center p-6 bg-red-50 border border-red-200 rounded-lg"
            role="alert"
          >
            <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
            <p className="mt-2 text-sm text-red-700 text-center max-w-md">
              The chat widget hit an error. Refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ hasError: false })}
              className="mt-4 px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
