import { useState } from "react";
import AuthLayout, {
  Field,
  SocialRow,
  SubmitButton,
} from "../../../components/AuthLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import { signupSchema, signinSchema } from "@devdraw/shared";
import {z} from "zod"
import authApi from "../../../api/auth.api";
import { useAuth } from "../../../context/auth.context";

export const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") === "signup" ? "signup" : "login";
  const [activeMode, setActiveMode] = useState<"login" | "signup">(mode);
  const isLogin = activeMode === "login";
  const navigate = useNavigate();
  const {setAuth} = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const schema = isLogin ? signinSchema : signupSchema.extend({
      confirm: z.string()
    }).refine(d => d.password === d.confirm, { path: ["confirm"], message: "Passwords do not match" });

    const result = schema.safeParse({ name, email, password, confirm });
    if (!result.success) {
      const next: Record<string, string> = {};
      result.error.issues.forEach(i => { next[i.path[0] as string] = i.message; });
      setErrors(next);return;
    }

    try {
      if(isLogin){
        const data = await authApi.signin(
          {
            email,
            password,
          }
        )
        setAuth(data.user,data.accessToken);
        navigate("/home")
      } else {
        const data = await authApi.signup({ name, email, password });
        setAuth(data.user, data.accessToken);
        navigate("/home");
      }
      
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? "Something went wrong";
      setErrors({ form: msg });
    }

    
  };

  return (
    <AuthLayout
      title={isLogin ? "Welcome back" : "Create your account"}
      subtitle={
        isLogin
          ? "Log in to continue designing on your infinite canvas."
          : "Start designing systems with AI-assisted precision."
      }
      footer={
        <>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => setActiveMode(isLogin ? "signup" : "login")}
            className="text-primary hover:text-technical-cyan transition-colors"
          >
            {isLogin ? "Sign up" : "Log in"}
          </button>
        </>
      }
    >
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-surface-container-lowest/70 border border-border-subtle mb-6">
        <button
          type="button"
          onClick={() => setActiveMode("login")}
          className={`h-9 rounded-md text-sm font-medium transition-all ${
            isLogin
              ? "bg-surface-container text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Log in
        </button>
        <button
          type="button"
          onClick={() => setActiveMode("signup")}
          className={`h-9 rounded-md text-sm font-medium transition-all ${
            !isLogin
              ? "bg-surface-container text-text-primary shadow-sm"
              : "text-text-secondary hover:text-text-primary"
          }`}
        >
          Sign up
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {!isLogin && (
          <Field
            id="name"
            label="Full name"
            autoComplete="name"
            placeholder="Jhon Jacob"
            value={name}
            onChange={setName}
            error={errors.name}
          />
        )}

        <Field
          id="email"
          label={isLogin ? "Email" : "Work email"}
          type="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={email}
          onChange={setEmail}
          error={errors.email}
        />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete={isLogin ? "current-password" : "new-password"}
          placeholder={isLogin ? "••••••••" : "At least 8 characters"}
          value={password}
          onChange={setPassword}
          error={errors.password}
        />

        {!isLogin && (
          <Field
            id="confirm"
            label="Confirm password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirm}
            onChange={setConfirm}
            error={errors.confirm}
          />
        )}

        {isLogin ? (
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                className="accent-[var(--technical-cyan)]"
              />
              Remember me
            </label>
            <a
              href="#"
              className="text-sm text-technical-cyan hover:opacity-80 transition-opacity"
            >
              Forgot password?
            </a>
          </div>
        ) : (
          <p className="text-xs text-text-secondary pt-1">
            By creating an account you agree to our Terms and Privacy Policy.
          </p>
        )}

        <div className="pt-2">
          {errors.form && (
            <p className="text-sm text-red-500 mb-2">{errors.form}</p>
          )}
          <SubmitButton>{isLogin ? "Log in" : "Create account"}</SubmitButton>
        </div>
      </form>

      <SocialRow />
    </AuthLayout>
  );
};
