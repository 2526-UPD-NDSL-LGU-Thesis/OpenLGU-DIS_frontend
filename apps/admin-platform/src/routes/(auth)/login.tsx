import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '#/features/login/login-form.tsx';

export const Route = createFileRoute('/(auth)/login')({
  component: Login,
})

function Login() {
  return (
    <>
      <LoginForm />
    </>
  )
}
