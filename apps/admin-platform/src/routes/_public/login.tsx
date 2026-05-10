import { createFileRoute } from '@tanstack/react-router';
import { z } from "zod";

import { LoginForm } from '#/features/auth/login-form.tsx';

export const Route = createFileRoute('/_public/login')({
  validateSearch: z.object({ redirect: z.union([z.string(), z.literal("/")]) }),
  beforeLoad: ({ search }) => {
    
  },
  component: Login,
})

function Login() {
  return (
    <>
      <LoginForm />
    </>
  )
}
