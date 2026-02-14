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