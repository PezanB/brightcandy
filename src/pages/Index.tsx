import { LoginHeader } from "@/components/auth/LoginHeader";
import { LoginForm } from "@/components/auth/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <LoginHeader />
      <main className="flex flex-col items-center justify-center px-4 py-12">
        <LoginForm />
      </main>
    </div>
  );
};

export default Index;