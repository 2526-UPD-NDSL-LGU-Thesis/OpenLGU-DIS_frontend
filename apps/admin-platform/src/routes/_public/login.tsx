import { createFileRoute } from '@tanstack/react-router';

import { LoginForm } from '#/features/auth/login-form.tsx';

export const Route = createFileRoute('/_public/login')({
  component: Login,
})

function Login() {
  return (
    <>
      <LoginForm />
    </>
  )
}
