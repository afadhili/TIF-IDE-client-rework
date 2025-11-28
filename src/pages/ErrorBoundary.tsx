import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Home, RefreshCw, AlertTriangle, Bug } from "lucide-react";
import WaveDecorations from "@/components/WaveDecorations";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    window.location.href = "/";
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <Bug className="h-10 w-10 text-destructive" />
              </div>
              <CardTitle className="text-3xl font-bold">
                Something went wrong
              </CardTitle>
              <CardDescription>
                An unexpected error occurred. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Details</AlertTitle>
                <AlertDescription className="mt-2">
                  <code className="text-xs block p-2 bg-background rounded">
                    {this.state.error?.message || "Unknown error"}
                  </code>
                </AlertDescription>
              </Alert>
              {/* @ts-expect-error process.env.NODE_ENV */}
              {process.env.NODE_ENV === "development" &&
                this.state.errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-2">
                      Stack Trace (Development Only)
                    </summary>
                    <pre className="p-4 bg-muted rounded overflow-auto max-h-64 text-xs">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
            </CardContent>
            <CardFooter className="flex flex-row sm:flex-col gap-2">
              <Button
                onClick={this.handleReload}
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Reload Page
              </Button>
              <Button onClick={this.handleReset} className="w-full">
                <Home className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </CardFooter>
          </Card>
          <WaveDecorations />
        </div>
      );
    }

    return this.props.children;
  }
}
