import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../lib/auth";
import { useState } from "react";
import { register, type User } from "../../../lib/api";
import type { AxiosError } from "axios";

export default function RegisterPage() {
  const auth = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
  }>({})

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)


  function validateName(value: string) {
    if (!value.trim()) return "Name is required"
    if (value.length < 2) return "Name must be at least 2 characters"
    return undefined
  }

  function validateEmail(value: string) {
    if (!value.trim()) return "Email is required"
    const regex = /\S+@\S+\.\S+/
    if (!regex.test(value)) return "Enter a valid email"
    return undefined
  }

  function validatePassword(value: string) {
    if (!value.trim()) return "Password is required"
    if (value.length < 6) return "Password must be at least 6 characters"
    return undefined
  }

  function validateAll() {
    const newErrors = {
      name: validateName(form.name),
      email: validateEmail(form.email),
      password: validatePassword(form.password),
    }

    setErrors(newErrors)

    return !newErrors.name && !newErrors.email && !newErrors.password
  }


  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget

    setForm((prev) => ({ ...prev, [name]: value }))

    if (touched[name as keyof typeof touched]) {
      setErrors((prev) => ({
        ...prev,
        [name]:
          name === "name"
            ? validateName(value)
            : name === "email"
            ? validateEmail(value)
            : validatePassword(value),
      }))
    }
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const { name, value } = e.currentTarget

    setTouched((prev) => ({ ...prev, [name]: true }))

    setErrors((prev) => ({
      ...prev,
      [name]:
        name === "name"
          ? validateName(value)
          : name === "email"
          ? validateEmail(value)
          : validatePassword(value),
    }))
  }


  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!validateAll()) return

    setLoading(true)

    try {
      const res = await register({
        name: form.name,
        email: form.email,
        password: form.password,
      })

      const data = res.data
      const user: User = data.user
      const token = data.token

      auth.login(user, token)
      navigate("/")
    } catch (err) {
      const ax = err as AxiosError<{ message: string }>
      if (ax.response?.data?.message) setError(ax.response.data.message)
      else setError("Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const nameError = touched.name && errors.name
  const emailError = touched.email && errors.email
  const passwordError = touched.password && errors.password

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 max-w-sm mx-auto bg-surface p-6 rounded-2xl shadow-lg"
    >
      <h1 className="text-xl font-semibold">Create account</h1>
      <p className="text-sm text-neutral-400 mb-4">
        Fill in your details to create an account.
      </p>

      {/* ---------- NAME ---------- */}
      <div>
        <label className="text-sm font-medium">Name</label>
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full rounded-2xl bg-inputBg p-3 outline-none focus:ring-2 focus:ring-accent ${
            nameError ? "ring-2 ring-red-500" : ""
          }`}
          placeholder="Your name"
        />

        {nameError && <p className="text-red-400 text-xs">{errors.name}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          onBlur={handleBlur}
          className={`w-full rounded-2xl bg-inputBg p-3 outline-none focus:ring-2 focus:ring-accent ${
            emailError ? "ring-2 ring-red-500" : ""
          }`}
          placeholder="you@example.com"
        />

        {emailError && <p className="text-red-400 text-xs">{errors.email}</p>}
      </div>

      <div>
        <label className="text-sm font-medium">Password</label>
        <div className="relative">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            onBlur={handleBlur}
            className={`w-full rounded-2xl bg-inputBg p-3 pr-16 outline-none focus:ring-2 focus:ring-accent ${
              passwordError ? "ring-2 ring-red-500" : ""
            }`}
            placeholder="••••••••"
          />

          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 inset-y-0 my-auto text-xs"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        {passwordError && (
          <p className="text-red-400 text-xs">{errors.password}</p>
        )}
      </div>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-2xl bg-accent hover:bg-accentHover text-bg p-3 disabled:opacity-60"
      >
        {loading ? "Creating..." : "Create account"}
      </button>

      <div className="text-xs text-neutral-400 mt-2 text-center">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => navigate("/login")}
          className="underline underline-offset-2 hover:text-neutral-200"
        >
          Login
        </button>
      </div>
    </form>
  );
}
