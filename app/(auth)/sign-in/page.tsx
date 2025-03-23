import { Metadata } from "next";
import SignInForm from "./sign-in-form";

export const metadata: Metadata = {
  title: 'Sign In'
}

const LoginPage = () => {
  
  return (
    <div className="w-screen flex justify-center items-center h-screen">
      <div className="w-xl">
        <h1 className="text-3xl text-center mb-10">Login to Gabag Indonesia.</h1>
        <SignInForm/>
      </div>
    </div>
  );
}

export default LoginPage;