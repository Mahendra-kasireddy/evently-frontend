import { useLogin } from './hooks';
import { Component } from './Component';

/** Orchestration: runs the two-step login hook and passes it to the card. */
export function LoginContainer() {
  const login = useLogin();
  return <Component login={login} />;
}
