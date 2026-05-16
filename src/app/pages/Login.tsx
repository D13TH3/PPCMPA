"use client";

import { useState, FormEvent, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { ScrollArea } from "../components/ui/scroll-area";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";
import {
  Waves,
  Lock,
  Mail,
  AlertCircle,
  Shield,
  ArrowLeft,
  X,
} from "lucide-react";
import { toast } from "sonner";

const DEMO_ACCOUNTS = [
  { label: "System Admin", email: "sysadmin@puertoprincesampa.gov" },
  { label: "Admin", email: "admin@puertoprincesampa.gov" },
  { label: "Staff", email: "staff@puertoprincesampa.gov" },
  { label: "Public User", email: "public@example.com" },
] as const;

const OTP_LENGTH = 6;

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!showOtp) setOtp("");
  }, [showOtp]);

  const completeLogin = async () => {
    setIsLoading(true);
    setError("");
    try {
      await login(email, password);
      setShowOtp(false);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch {
      setError("Invalid email or password");
      toast.error("Login failed. Please try again.");
      setShowOtp(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialsSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password");
      return;
    }
    if (!agreedToTerms) {
      setError("Please agree to the Terms and Conditions");
      return;
    }

    setShowOtp(true);
  };

  const handleOtpSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (otp.length < OTP_LENGTH) return;
    completeLogin();
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("demo");
    setAgreedToTerms(true);
    setError("");
  };

  const otpComplete = otp.length === OTP_LENGTH;

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left — Sign in */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 py-10 lg:p-12 bg-[#f4f8fb] min-h-screen">
        <div className="w-full max-w-[420px]">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-6 flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>

          <div className="mb-8 space-y-3 text-center">
            <div className="flex justify-center w-full">
              <div className="flex items-center justify-center bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 p-3 rounded-xl shadow-md">
                <Waves className="w-9 h-9 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-[2rem] font-bold text-slate-900 leading-tight">
              Welcome Back
            </h1>
            <p className="text-slate-500 text-base">
              Puerto Princesa MPA Management System
            </p>
          </div>

          <Card className="shadow-lg border border-slate-100/80 bg-white rounded-2xl">
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-2xl font-bold text-slate-900">
                Sign In
              </CardTitle>
              <CardDescription className="text-slate-500">
                Enter your credentials to access the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                {error && !showOtp && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-800">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@puertoprincesampa.gov"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-11 h-12 text-base bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-slate-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-11 h-12 text-base bg-slate-50 border-slate-200 rounded-xl focus-visible:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <label
                    htmlFor="terms"
                    className="text-sm text-slate-600 leading-relaxed"
                  >
                    I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTerms(true)}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      Terms and Conditions
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      onClick={() => setShowPrivacy(true)}
                      className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    >
                      Privacy Policy
                    </button>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 hover:from-blue-700 hover:via-blue-600 hover:to-teal-600 shadow-md border-0 disabled:opacity-50"
                  disabled={!agreedToTerms}
                >
                  Sign In
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-3 bg-white text-slate-400">
                      Demo Accounts
                    </span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  {DEMO_ACCOUNTS.map((demo) => (
                    <Button
                      key={demo.email}
                      type="button"
                      variant="outline"
                      className="justify-center gap-2 h-10 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50"
                      onClick={() => fillDemo(demo.email)}
                    >
                      <Shield className="w-4 h-4 text-slate-500" />
                      {demo.label}
                    </Button>
                  ))}
                </div>
              </div>

              <p className="mt-6 text-center text-sm text-slate-500">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="font-medium text-blue-600 hover:underline"
                >
                  Sign up
                </button>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right — Branding */}
      <div
        className="hidden lg:flex lg:w-1/2 min-h-screen relative items-center justify-center px-10 py-12 overflow-hidden"
        style={{
          background: "linear-gradient(180deg, #46B3E6 0%, #2DCC9F 100%)",
        }}
      >
        <div className="relative z-10 w-full max-w-[400px] rounded-[28px] border border-white/35 bg-white/18 backdrop-blur-md px-10 py-12 shadow-[0_8px_32px_rgba(0,0,0,0.08)] text-center text-white">
          <p className="text-[11px] font-medium tracking-[0.28em] uppercase mb-8 text-white">
            PUERTO PRINCESA MPA
          </p>
          <h2 className="text-[1.65rem] xl:text-[1.85rem] font-bold leading-snug mb-5">
            Protect the Sea.
            <br />
            Protect the City.
          </h2>
          <p className="text-sm leading-relaxed text-white/95 max-w-[320px] mx-auto">
            Join local conservation efforts with safety, reports, and
            community-driven monitoring.
          </p>
        </div>
      </div>

      {/* OTP verification (demo — any 6 digits) */}
      <Dialog open={showOtp} onOpenChange={setShowOtp}>
        <DialogContent className="sm:max-w-md rounded-2xl p-0 gap-0 overflow-hidden border-slate-200 shadow-2xl [&>button:last-child]:hidden">
          <button
            type="button"
            onClick={() => setShowOtp(false)}
            className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors z-10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          <form onSubmit={handleOtpSubmit} className="p-8 pt-10">
            <DialogHeader className="text-center space-y-2 mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900">
                Enter OTP
              </DialogTitle>
              <DialogDescription className="text-slate-500 text-sm leading-relaxed">
                A 6-digit verification code has been sent to your phone number.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div className="space-y-3">
                <Label className="text-slate-700 font-medium">
                  Verification Code
                </Label>
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={OTP_LENGTH}
                    value={otp}
                    onChange={setOtp}
                    autoFocus
                    containerClassName="gap-2"
                  >
                    <InputOTPGroup className="gap-2">
                      {Array.from({ length: OTP_LENGTH }).map((_, i) => (
                        <InputOTPSlot
                          key={i}
                          index={i}
                          className="h-12 w-11 rounded-lg border-slate-200 bg-slate-50 text-lg font-semibold text-slate-900 first:rounded-lg last:rounded-lg border data-[active=true]:border-blue-500 data-[active=true]:ring-2 data-[active=true]:ring-blue-500/20"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <p className="text-xs text-center text-slate-400">
                  Demo: enter any 6 digits (e.g. 123456)
                </p>
              </div>

              <Button
                type="submit"
                disabled={!otpComplete || isLoading}
                className={`w-full h-12 rounded-xl text-base font-semibold transition-all ${
                  otpComplete
                    ? "bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-700 hover:to-teal-600 text-white shadow-md"
                    : "bg-slate-200 text-slate-500 cursor-not-allowed hover:bg-slate-200"
                }`}
              >
                {isLoading ? "Signing in..." : "Log In"}
              </Button>

              <p className="text-xs text-center text-slate-400 leading-relaxed">
                Didn&apos;t receive the code? Check your SMS messages or try
                again later.
              </p>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Terms and Conditions Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-700">
              Terms and Conditions
            </DialogTitle>
            <DialogDescription>
              Please read these terms and conditions carefully before using the
              Puerto Princesa MPA Management System.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-base mb-2">
                  1. Acceptance of Terms
                </h3>
                <p>
                  By accessing and using the Puerto Princesa Marine Protected
                  Area (MPA) Dynamic Management and Spatial Information System,
                  you accept and agree to be bound by these terms.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">
                  2. User Responsibilities
                </h3>
                <p>
                  Maintain confidentiality of credentials, use the system only
                  for authorized government purposes, and ensure data accuracy.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">3. Contact</h3>
                <p>
                  Marine Protected Area Management Office — mpa@puertoprincesampa.gov
                </p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={showPrivacy} onOpenChange={setShowPrivacy}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl text-blue-700">
              Privacy Policy
            </DialogTitle>
            <DialogDescription>
              How we collect, use, and protect your information.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] pr-4">
            <div className="space-y-4 text-sm text-gray-700">
              <section>
                <h3 className="font-semibold text-base mb-2">1. Introduction</h3>
                <p>
                  Puerto Princesa City Government is committed to protecting
                  user privacy within the MPA Management System.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">
                  2. Information We Collect
                </h3>
                <p>
                  Account information, authentication data, usage logs, and
                  geospatial data entered in the system.
                </p>
              </section>
              <section>
                <h3 className="font-semibold text-base mb-2">3. Contact</h3>
                <p>privacy@puertoprincesampa.gov</p>
              </section>
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
