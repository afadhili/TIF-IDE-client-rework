import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "./signup.schema";
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetchApi } from "@/lib/api";

export default function SignupForm({
  setIsSignIn,
  className,
}: {
  setIsSignIn: () => void;
  className?: string;
}) {
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      nim: "",
      name: "",
      password: "",
      confirmPassword: "",
    },
  });

  const handleSubmit = async (data: {
    nim: string;
    name: string;
    password: string;
    confirmPassword: string;
  }) => {
    setIsLoading(true);

    try {
      const response = await fetchApi(`users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nim: data.nim,
          name: data.name,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      // Success
      console.log("Signup successful:", result);

      toast.success("You have successfully signed up!", {
        duration: 3000,
      });

      setIsSignIn();

      form.reset();
    } catch (error) {
      console.error("Signup error:", error);

      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        {
          duration: 3000,
        },
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(handleSubmit)(e);
        }}
        className={cn("space-y-2", className)}
      >
        <FormField
          control={form.control}
          name="nim"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                NIM<span className="text-primary">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Your nim" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Name<span className="text-primary">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Your name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Password<span className="text-primary">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Confirm Password<span className="text-primary">*</span>
              </FormLabel>
              <FormControl>
                <Input type="password" placeholder="******" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>
    </Form>
  );
}
