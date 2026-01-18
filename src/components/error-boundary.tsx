import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
          <h1 className="text-4xl font-bold text-destructive mb-4">Oops! Terjadi Kesalahan</h1>
          <p className="text-muted-foreground mb-8 max-w-md">Maaf, aplikasi mengalami masalah yang tidak terduga.</p>
          <div className="bg-muted p-4 rounded-md mb-8 max-w-lg overflow-auto text-left w-full">
            <code className="text-sm text-destructive font-mono">{this.state.error?.message || "Unknown Error"}</code>
          </div>
          <Button onClick={this.handleReload} variant="default">
            Muat Ulang Halaman
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
