
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Testimonial } from "@/components/auth/Testimonial";

const SignUp = () => {
  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="flex flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 relative">
        <SignUpForm />
      </div>
      <div className="hidden md:block">
        <Testimonial />
      </div>
    </div>
  );
};

export default SignUp;
