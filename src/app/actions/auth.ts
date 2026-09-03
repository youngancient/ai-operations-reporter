'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const password = formData.get('password')
  const envPassword = process.env.EXECUTIVE_PASSWORD

  if (!envPassword) {
    return { error: 'Server configuration error: password not set' }
  }

  if (password === envPassword) {
    const cookieStore = await cookies()
    cookieStore.set('exec_session', 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    })
    // Will redirect to home on success
  } else {
    return { error: 'Invalid password' }
  }

  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete('exec_session')
  redirect('/login')
}
