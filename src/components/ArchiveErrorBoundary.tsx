import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  onBack: () => void;
};

type State = {
  hasError: boolean;
};

export class ArchiveErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Archive crashed:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section
          aria-label="Archive error"
          className="flex h-full flex-col items-center justify-center gap-4 px-5 text-center"
        >
          <p className="text-[15px] leading-5 text-[var(--text-900)]">Something went wrong. Go back</p>
          <button
            type="button"
            onClick={() => {
              this.setState({ hasError: false });
              this.props.onBack();
            }}
            className="h-11 rounded-full border border-[var(--line)] bg-white px-5 text-[13px] font-medium text-[var(--purple-500)]"
          >
            Go back
          </button>
        </section>
      );
    }
    return this.props.children;
  }
}
