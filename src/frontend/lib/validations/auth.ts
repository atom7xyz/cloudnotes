import * as z from "zod";

/**
 * Schema for login form validation
 */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email è obbligatoria" })
    .email({ message: "Indirizzo email non valido" }),
  password: z
    .string()
    .min(1, { message: "La password è obbligatoria" })
    .min(8, { message: "La password deve essere di almeno 8 caratteri" }),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Schema for registration form validation
 */
export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, { message: "Il nome è obbligatorio" })
      .max(50, { message: "Il nome deve essere inferiore a 50 caratteri" }),
    lastName: z
      .string()
      .min(1, { message: "Il cognome è obbligatorio" })
      .max(50, { message: "Il cognome deve essere inferiore a 50 caratteri" }),
    email: z
      .string()
      .min(1, { message: "L'email è obbligatoria" })
      .email({ message: "Indirizzo email non valido" }),
    password: z
      .string()
      .min(1, { message: "La password è obbligatoria" })
      .min(8, { message: "La password deve essere di almeno 8 caratteri" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Conferma la password" }),
    acceptTerms: z.boolean().refine(val => val === true, {
      message: "Devi accettare i termini e condizioni",
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Schema for forgot password form validation
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "L'email è obbligatoria" })
    .email({ message: "Indirizzo email non valido" }),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

/**
 * Schema for OTP verification form validation
 */
export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, { message: "L'OTP deve essere di 6 cifre" })
    .max(6, { message: "L'OTP deve essere di 6 cifre" })
    .regex(/^\d{6}$/, { message: "L'OTP deve contenere solo cifre" }),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

/**
 * Schema for reset password form validation
 */
export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(1, { message: "La password è obbligatoria" })
      .min(8, { message: "La password deve essere di almeno 8 caratteri" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Conferma la password" }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Le password non corrispondono",
    path: ["confirmPassword"],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>; 