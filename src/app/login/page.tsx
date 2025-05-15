import Topbar from "@/components/app-topbar"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <>
      <Topbar title={''}/>
      <div className="bg-background flex flex-col items-center justify-center mt-6 gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <LoginForm />
        </div>
      </div>
    </>
  )
}
