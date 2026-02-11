import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Lock, Mail, Shield } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useAdminAuth from "../../../context/AdminAuthContext";
import Logo from '../../../assets/tran.png'

// Define interfaces and types
interface FormData {
  email: string;
  password: string;
  otp: string;
}

interface Errors {
  email?: string;
  password?: string;
  otp?: string;
  general?: string;
}

interface Touched {
  email?: boolean;
  password?: boolean;
  otp?: boolean;
}

const AdminLogin: React.FC = () => {
  const { login, verifyOTP, loginWithGoogle, isLoading: authLoading, isAuthenticated, isOTPRequired, pendingAdminId, handleSetIsOTPRequired } = useAdminAuth();

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    otp: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || "/admin/dashboard";
      navigate(from);
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  // Real-time validation functions
  const validateEmail = (email: string): string => {
    if (!email) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  const validateOTP = (otp: string): string => {
    if (!otp) {
      return "OTP is required";
    }
    if (!/^\d{6}$/.test(otp)) {
      return "OTP must be a 6-digit number";
    }
    return "";
  };

  // Validate field on change
  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      case "otp":
        return validateOTP(value);
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    if (touched[name as keyof Touched] || value !== "") {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    if (!isOTPRequired) {
      newErrors.email = validateEmail(formData.email);
      newErrors.password = validatePassword(formData.password);
    } else {
      newErrors.otp = validateOTP(formData.otp);
    }

    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key as keyof Errors]) {
        delete newErrors[key as keyof Errors];
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setTouched({
      email: !isOTPRequired ? true : touched.email,
      password: !isOTPRequired ? true : touched.password,
      otp: isOTPRequired ? true : touched.otp,
    });

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      if (!isOTPRequired) {
        const response = await login({
          adminEmail: formData.email,
          password: formData.password,
        });

        if (response.authenticated) {
          const from = location.state?.from?.pathname || "/admin/dashboard";
          navigate(from);
        } else if (response.twoFARequired) {
          // OTP required; form will switch to OTP input
        } else {
          setErrors({ general: response.message || "Login failed" });
        }
      } else {
        if (!pendingAdminId) {
          setErrors({ general: "No pending login session found" });
          setIsLoading(false);
          return;
        }

        const response = await verifyOTP({
          adminId: pendingAdminId,
          otp: formData.otp,
        });

        if (response.authenticated) {
          const from = location.state?.from?.pathname || "/admin/dashboard";
          navigate(from);
        } else {
          setErrors({ general: response.message || "Invalid OTP" });
        }
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    handleSetIsOTPRequired({ otpRequired: false });
    setFormData((prev) => ({ ...prev, otp: "" }));
    setErrors({});
    setTouched((prev) => ({ ...prev, otp: false }));
  };

  // Handle Google Login
  const handleGoogleLogin = () => {
    setIsLoading(true);
    try {
      loginWithGoogle(false); // Use popup-based Google login
    } catch (error: any) {
      setErrors({ general: "Google login failed. Please try again." });
      setIsLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    if (!isOTPRequired) {
      return !!formData.email && !!formData.password && !errors.email && !errors.password;
    } else {
      return !!formData.otp && !errors.otp;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 relative overflow-hidden">
      {/* Animated background elements */}
    

      {/* Login Card */}
      <div className="relative w-full max-w-lg">
        {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-200 to-purple-200 rounded-3xl blur-2xl opacity-40"></div>÷ */}
        
        <div className="relative bg-white backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200 p-8 md:p-10">
          {/* Logo & Header */}
          <div className="text-center mb-8">
       
            
            <div className="flex items-center justify-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-blue-600" />
              <span className="text-blue-600 text-sm font-semibold tracking-wider">ADMIN PORTAL</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
              {isOTPRequired ? "Verify OTP" : "Welcome Back"}
            </h1>
            <p className="text-gray-600 text-sm">
              {isOTPRequired ? "Enter the code sent to your email" : "Sign in to access your dashboard"}
            </p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm text-center">{errors.general}</p>
            </div>
          )}

          {/* Login or OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isOTPRequired ? (
              <>
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 ${
                        errors.email
                          ? "border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      } focus:outline-none`}
                      placeholder="admin@example.com"
                      disabled={isLoading || authLoading}
                    />
                  </div>
                  {errors.email && touched.email && (
                    <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-12 py-3 rounded-xl border transition-all duration-200 ${
                        errors.password
                          ? "border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      } focus:outline-none`}
                      placeholder="••••••••"
                      disabled={isLoading || authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                      disabled={isLoading || authLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && touched.password && (
                    <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-end">
               
                </div>
              </>
            ) : (
              <>
                {/* OTP Field */}
                <div>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Verification Code
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Shield className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={formData.otp}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border transition-all duration-200 text-center text-2xl tracking-widest ${
                        errors.otp
                          ? "border-red-300 bg-red-50 text-red-900 placeholder-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200"
                          : "border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      } focus:outline-none`}
                      placeholder="000000"
                      disabled={isLoading || authLoading}
                      maxLength={6}
                    />
                  </div>
                  {errors.otp && touched.otp && (
                    <p className="mt-2 text-sm text-red-600">{errors.otp}</p>
                  )}
                </div>

                {/* Back to Login Link */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    disabled={isLoading || authLoading}
                  >
                    ← Back to Login
                  </button>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading || !isFormValid()}
              className="w-full bg-primary-500 text-white py-3.5 px-4 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isOTPRequired ? "Verifying..." : "Signing in..."}
                </div>
              ) : isOTPRequired ? (
                "Verify Code"
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            {!isOTPRequired && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-3 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            )}

            {/* Login with Google Button */}
            {!isOTPRequired && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || authLoading}
                className="w-full flex items-center justify-center border border-gray-300 bg-white text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <svg
                  className="w-5 h-5 mr-2"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.02.68-2.33 1.08-3.71 1.08-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {isLoading || authLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    Connecting...
                  </div>
                ) : (
                  "Sign in with Google"
                )}
              </button>
            )}
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              © 2026 My System. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default AdminLogin;