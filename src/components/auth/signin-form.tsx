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
import { fetchApi } from "@/lib/api";
import { useState } from "react";
import { toast } from "sonner";
import { Loader } from "lucide-react";
import { signinSchema } from "./signin.schema";
import { useAuth } from "@/context/use-auth";
import { cn } from "@/lib/utils";

export default function SigninForm({ className }: { className?: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshAuth } = useAuth();

  const form = useForm({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      nim: "",
      password: "",
    },
  });

  const handleSubmit = async (data: { nim: string; password: string }) => {
    setIsLoading(true);

    try {
      const response = await fetchApi(`users/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nim: data.nim,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Sigin failed");
      }

      localStorage.setItem("user", JSON.stringify(result.user));
      localStorage.setItem("token", result.token);

      toast.success("You have successfully signed in!", {
        duration: 3000,
      });

      refreshAuth();

      form.reset();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
        {
          duration: 3000,
        },
      );

      form.resetField("password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
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
        <Button type="submit" size="sm" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <Loader className="animate-spin" size={20} />
          ) : (
            "Sign In"
          )}
        </Button>
      </form>
    </Form>
  );
}
