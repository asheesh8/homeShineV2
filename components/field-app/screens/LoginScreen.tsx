"use client";

import { HomeShineLogo } from "@/components/homeshine-logo";
import { Button, FieldLabel, Panel, TextInput } from "@/components/field-app/ui";
import type { LoginForm } from "@/components/field-app/types";

export function LoginScreen({
  loginForm,
  loginError,
  onChange,
  onSubmit,
}: {
  loginForm: LoginForm;
  loginError: string;
  onChange: (key: keyof LoginForm, value: string) => void;
  onSubmit: () => void;
}) {
  return (
    <section className="hs-narrow hs-screen-enter">
      <Panel className="hs-login-panel">
        <HomeShineLogo size={72} />
        <div>
          <p className="hs-kicker">HomeSHINE Field</p>
          <h1>Sign in</h1>
          <p className="hs-muted">
            Use an admin account to create assessments, build service packets, and finish checkout.
          </p>
        </div>
        <div className="hs-form-grid">
          <div>
            <FieldLabel>Username</FieldLabel>
            <TextInput
              aria-label="Username"
              value={loginForm.username}
              onChange={(e) => onChange("username", e.target.value)}
            />
          </div>
          <div>
            <FieldLabel>Password</FieldLabel>
            <TextInput
              type="password"
              aria-label="Password"
              value={loginForm.password}
              onChange={(e) => onChange("password", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSubmit()}
            />
          </div>
        </div>
        {loginError && <div className="hs-error">{loginError}</div>}
        <Button type="button" wide onClick={onSubmit}>
          Sign in
        </Button>
      </Panel>
    </section>
  );
}
