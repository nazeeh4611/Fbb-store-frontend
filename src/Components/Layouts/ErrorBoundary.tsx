import React from "react";

interface State {
  error: Error | null;
}

/**
 * Catches render errors so one broken component never blanks the whole store.
 * Also recovers from "chunk failed to load" after a new deployment by reloading once.
 */
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    const isChunkError = /Loading chunk|Failed to fetch dynamically imported module|Importing a module script failed/i.test(
      error?.message || ""
    );
    if (isChunkError) {
      try {
        if (!sessionStorage.getItem("chunk-reload")) {
          sessionStorage.setItem("chunk-reload", "1");
          window.location.reload();
          return;
        }
      } catch {
        /* storage blocked */
      }
    }
    console.error("UI error:", error);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
        <div className="max-w-md w-full text-center bg-white rounded-2xl border border-stone-200 p-8 shadow-sm">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 text-xl font-semibold">
            !
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Something went wrong</h1>
          <p className="text-stone-600 mb-6 text-sm">
            We hit an unexpected problem loading this page. Please try again.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 rounded-lg bg-stone-900 text-white text-sm font-medium hover:bg-stone-800 transition-colors"
            >
              Reload page
            </button>
            <a
              href="/"
              className="px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 text-sm font-medium hover:bg-stone-100 transition-colors"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
