import z from "zod";

export const signinSchema = z.object({
  nim: z
    .string()
    .min(9, { message: "NIM must be at least 9 characters" })
    .max(11),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(16),
});
