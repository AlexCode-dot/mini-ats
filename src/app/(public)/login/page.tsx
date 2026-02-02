import { Suspense } from "react";

import LoginView from "@/features/auth/components/LoginView/LoginView";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginView />
    </Suspense>
  );
}
