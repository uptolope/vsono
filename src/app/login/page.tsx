import { Suspense } from 'react';
import LoginFormClient from './LoginFormClient';

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginFormClient />
    </Suspense>
  );
}
