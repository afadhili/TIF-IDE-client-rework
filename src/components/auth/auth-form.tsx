import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SigninForm from "./signin-form";
import SignupForm from "./signup-form";
import { useEffect, useState } from "react";

export default function AuthForm() {
  const [isSignIn, setIsSignIn] = useState(true);

  useEffect(() => {
    document.title =
      "TIF-IDE | Home Page | " + (isSignIn ? "Sign In" : "Sign Up");
  }, [isSignIn]);

  return (
    <div className="flex justify-center lg:justify-end lg:order-1">
      <Card className="w-full max-w-md bg-card backdrop-blur-md border-border shadow-2xl">
        <CardHeader className="space-y-6 pb-6">
          {/* Toggle Tabs */}
          <Tabs value={isSignIn ? "signin" : "signup"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-secondary">
              <TabsTrigger
                value="signin"
                onClick={() => setIsSignIn(true)}
                className="data-[state=active]:bg-card data-[state=active]:text-white cursor-pointer"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                onClick={() => setIsSignIn(false)}
                className="data-[state=active]:bg-card data-[state=active]:text-white cursor-pointer"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                className="w-12 h-12 pointer-events-none"
                alt="Logo"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold text-white">
                Welcome to TIF-IDE
              </CardTitle>
              <CardDescription className="text-slate-400">
                {isSignIn
                  ? "Sign in to your account to continue"
                  : "Create your account to get started"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Auth Form */}
          {isSignIn ? (
            <SigninForm />
          ) : (
            <SignupForm setIsSignIn={() => setIsSignIn(true)} />
          )}
        </CardContent>

        <CardFooter className="flex justify-center pt-6 border-t border-slate-700/50">
          <p className="text-center text-sm text-slate-500">
            Copyright &copy; 2025{" "}
            <a
              className="hover:text-blue-400 transition-colors font-medium text-slate-400"
              href="https://github.com/afadhili"
              target="_blank"
              rel="noopener noreferrer"
            >
              @afadhili
            </a>
            . All rights reserved.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
