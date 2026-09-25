import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean };

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("App crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="frame-page">
          <div className="phone-frame flex flex-col items-center justify-center gap-4 px-5 text-center">
            <p className="text-[15px] leading-5 text-[var(--text-900)]">Something went wrong. Reload</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="h-11 rounded-full border border-[var(--line)] bg-white px-5 text-[13px] font-medium text-[var(--purple-500)]"
            >
              Reload
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
