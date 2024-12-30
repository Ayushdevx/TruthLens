"use client";
import { useRouter } from 'next/navigation';
import SignupFormDemo from '@/components/signup-form-demo';
import Background3D from '@/components/Background3D';

export default function SignupPage() {
  const router = useRouter();

  const handleSignupSuccess = () => {
    router.push('/auth/login');
  };

  return (
    <>
      <Background3D />
      <div className="min-h-screen pt-20 px-4">
        <SignupFormDemo />
      </div>
    </>
  );
}