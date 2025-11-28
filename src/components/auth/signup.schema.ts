import z from "zod";

export const signupSchema = z.object({
  nim: z
    .string()
    .min(9, { message: "NIM must be at least 9 characters" })
    .max(11),
  name: z
    .string()
    .min(6, { message: "Name must be at least 6 characters" })
    .max(150),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(16),
  confirmPassword: z
    .string()
    .min(6, { message: "Confirm Password must be at least 6 characters" })
    .max(16),
});
