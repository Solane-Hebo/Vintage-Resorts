import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, type User } from "../../../lib/api";
import type { AxiosError } from "axios";
import { useAuth } from "../../../lib/auth";

export default function LoginPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState<{ email: string; password: string }>({
    email: "",
    password: "",
  })

  const [formErrors, setFormErrors] = useState<{
    email?: string
    password?: string
  }>({})

  const [touched, setTouched] = useState<{
    email: boolean
    password: boolean
  }>({
    email: false,
    password: false,
  })

  const [error, setError] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)

  const [showPassword, setShowPassword] = useState<boolean>(false)


  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return "Email is required"
    const regex = /\S+@\S+\.\S+/
    if (!regex.test(value)) return "Enter a valid email address"
    return undefined
  }

  function validatePassword(value: string): string | undefined {
    if (!value.trim()) return "Password is required"
    if (value.length < 6) return "Password must be at least 6 characters"
    return undefined
  }

  function validateField(
    name: "email" | "password",
    value: string
  ): string | undefined {
    return name === "email" ? validateEmail(value) : validatePassword(value)
  }

  // Validate all fields before submit
  function validateForm(): boolean {
    const errors = {
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    };

    setFormErrors(errors)

    return !errors.email && !errors.password
  }


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget

    setForm((prev) => ({ ...prev, [name]: value }))

    if (touched[name as "email" | "password"]) {
      const fieldError = validateField(name as "email" | "password", value)
      setFormErrors((prev) => ({ ...prev, [name]: fieldError }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget

    setTouched((prev) => ({ ...prev, [name]: true }))

    const fieldError = validateField(name as "email" | "password", value);
    setFormErrors((prev) => ({ ...prev, [name]: fieldError }))
  }


  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    if (!validateForm()) return;

    setLoading(true)

    try {
      const res = await login({ email: form.email, password: form.password })
      const data = res.data

      const storedUser: User = data.user
      const storedToken = data.token

      auth.login(storedUser, storedToken)
      navigate("/")
    } catch (err: unknown) {
      const ax = err as AxiosError<{ message: string }>
      if (ax.response?.data?.message) {
        setError(ax.response.data.message)
      } else {
        setError("Login failed. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const emailHasError = touched.email && !!formErrors.email
  const passwordHasError = touched.password && !!formErrors.password

  const isSubmitDisabled =
    loading ||
    !form.email.trim() ||
    !form.password.trim() ||
    !!formErrors.email ||
    !!formErrors.password

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 max-w-sm mx-auto bg-surface rounded-2xl p-6 shadow-lg"
      noValidate
      aria-describedby={error ? "form-error" : undefined}
    >
      <h1 className="text-xl font-semibold mb-1">Login</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Sign in with your email and password.
      </p>

      <div className="space-y-1">
        <label htmlFor="email" className="text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className={`w-full rounded-2xl bg-inputBg p-3 outline-none focus:ring-2 focus:ring-[#d9a886] ${
            emailHasError ? "ring-2 ring-red-500" : ""
          }`}
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={emailHasError}
          aria-describedby={emailHasError ? "email-error" : undefined}
          autoComplete="email"
        />
        {emailHasError && (
          <p id="email-error" className="text-red-400 text-xs">
            {formErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            className={`w-full rounded-2xl bg-inputBg p-3 pr-16 outline-none focus:ring-2 focus:ring-[#d9a886] ${
              passwordHasError ? "ring-2 ring-red-500" : ""
            }`}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={passwordHasError}
            aria-describedby={passwordHasError ? "password-error" : undefined}
            autoComplete="current-password"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-3 my-auto text-xs font-medium"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {passwordHasError && (
          <p id="password-error" className="text-red-400 text-xs">
            {formErrors.password}
          </p>
        )}
      </div>

      {error && (
        <p id="form-error" className="text-red-400 text-sm" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitDisabled}
        className="w-full rounded-2xl bg-[#d9a886] hover:bg-[#a06e57] text-[#0f0f10] p-3 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Logging in..." : "Login"}
      </button>

      <div className="flex items-center justify-between text-xs text-neutral-400 mt-2">
        <button
          type="button"
          className="underline underline-offset-2 hover:text-neutral-200"
        >
          Forgot password?
        </button>
        <button
          type="button"
          onClick={() => navigate("/register")}
          className="underline underline-offset-2 hover:text-neutral-200"
        >
          Create account
        </button>
      </div>
    </form>
  );
}
