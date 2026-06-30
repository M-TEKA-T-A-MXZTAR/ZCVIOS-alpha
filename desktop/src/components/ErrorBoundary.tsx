import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; message: string };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message || "Unknown desktop error" };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("ZCVIOS desktop shell error", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="fatal-error" role="alert">
          <p className="eyebrow">Recoverable shell error</p>
          <h1>ZCVIOS could not render this view.</h1>
          <p>{this.state.message}</p>
          <button type="button" onClick={() => window.location.reload()}>
            Reload desktop shell
          </button>
        </main>
      );
    }

    return this.props.children;
  }
}
