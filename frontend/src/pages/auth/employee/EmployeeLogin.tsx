import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Users, Building2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import useEmployeeAuth from "../../../context/EmployeeAuthContext";

// Define interfaces and types
interface FormData {
  identifier: string;
  password: string;
  otp: string;
}

interface Errors {
  identifier?: string;
  password?: string;
  otp?: string;
  general?: string;
}

interface Touched {
  identifier?: boolean;
  password?: boolean;
  otp?: boolean;
}

const EmployeeLogin: React.FC = () => {
  const { login, verifyOTP, loginWithGoogle, isLoading: authLoading, isAuthenticated, isOTPRequired, pendingEmployeeId, handleSetIsOTPRequired } = useEmployeeAuth();

  const [formData, setFormData] = useState<FormData>({
    identifier: "",
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
      const from = location.state?.from?.pathname || "/employee/dashboard";
      navigate(from);
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  // Real-time validation functions
  const validateIdentifier = (identifier: string): string => {
    if (!identifier) {
      return "Email or phone number is required";
    }
    // Basic validation for email or phone
    if (!/\S+@\S+\.\S+/.test(identifier) && !/^\+?\d{10,15}$/.test(identifier)) {
      return "Please enter a valid email or phone number";
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
      case "identifier":
        return validateIdentifier(value);
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
      newErrors.identifier = validateIdentifier(formData.identifier);
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
      identifier: !isOTPRequired ? true : touched.identifier,
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
          identifier: formData.identifier,
          password: formData.password,
        });

        if (response.authenticated) {
          const from = location.state?.from?.pathname || "/employee/dashboard";
          navigate(from);
        } else if (response.otpRequired) {
          // OTP required; form will switch to OTP input
        } else {
          setErrors({ general: response.message || "Login failed" });
        }
      } else {
        if (!pendingEmployeeId) {
          setErrors({ general: "No pending login session found" });
          setIsLoading(false);
          return;
        }

        const response = await verifyOTP({
          employeeId: pendingEmployeeId,
          otp: formData.otp,
        });

        if (response.authenticated) {
          const from = location.state?.from?.pathname || "/employee/dashboard";
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
      loginWithGoogle(false); // Use redirect-based Google login
    } catch (error: any) {
      setErrors({ general: "Google login failed. Please try again." });
      setIsLoading(false);
    }
  };

  const isFormValid = (): boolean => {
    if (!isOTPRequired) {
      return !!formData.identifier && !!formData.password && !errors.identifier && !errors.password;
    } else {
      return !!formData.otp && !errors.otp;
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-primary-200 rounded-full opacity-30 blur-lg"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-primary-300 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-primary-200 rounded-full opacity-25 blur-lg"></div>
      </div>

      {/* Left side - Brand and illustration */}
      <div
        className="w-5/12 flex items-center justify-center p-8 relative z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600/75 to-primary-500/85"></div>
        <div className="max-w-lg text-white relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold mb-6 text-white">
              Empowering employees with seamless HR access.
            </h1>
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex items-center space-x-4 p-6">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <div className="w-12 h-12 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-8 h-8 bg-primary-300/80 rounded-full animate-pulse"></div>
                <div className="absolute -bottom-2 -left-6 w-4 h-4 bg-primary-200/70 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              </div>
            </div>
            <p className="text-primary-100 text-lg leading-relaxed">
              Access your HR tools and manage your profile effortlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login or OTP form */}
      <div className="w-7/12 bg-white flex flex-col justify-center p-8 relative z-10">
        <div className="w-full max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center mr-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">ABY HR</h2>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {isOTPRequired ? "Verify OTP" : "Employee Sign In"}
            </h3>
            <p className="text-gray-600 text-sm">
              {isOTPRequired
                ? "Enter the 6-digit OTP sent to your email or phone"
                : "Please enter your email or phone number to sign in"}
            </p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Login or OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isOTPRequired ? (
              <>
                {/* Identifier Field */}
                <div>
                  <label
                    htmlFor="identifier"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email or Phone Number
                  </label>
                  <input
                    type="text"
                    id="identifier"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      errors.identifier
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
                    } focus:outline-none focus:ring-4`}
                    placeholder="Enter your email or phone"
                    disabled={isLoading || authLoading}
                  />
                  {errors.identifier && touched.identifier && (
                    <p className="mt-1 text-sm text-red-600">{errors.identifier}</p>
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
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors duration-200 ${
                        errors.password
                          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                          : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
                      } focus:outline-none focus:ring-4`}
                      placeholder="Enter your password"
                      disabled={isLoading || authLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
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
                    <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Forgot Password */}
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    onClick={() => console.log('Forgot password clicked')}
                  >
                    Forgot Password?
                  </button>
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
                    OTP Code
                  </label>
                  <input
                    type="text"
                    id="otp"
                    name="otp"
                    value={formData.otp}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                      errors.otp
                        ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                        : "border-gray-300 focus:border-primary-500 focus:ring-primary-500/20"
                    } focus:outline-none focus:ring-4`}
                    placeholder="Enter 6-digit OTP"
                    disabled={isLoading || authLoading}
                    maxLength={6}
                  />
                  {errors.otp && touched.otp && (
                    <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                  )}
                </div>

                {/* Back to Login Link */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleBackToLogin}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    disabled={isLoading || authLoading}
                  >
                    Back to Login
                  </button>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading || !isFormValid()}
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  {isOTPRequired ? "Verifying OTP..." : "Signing in..."}
                </div>
              ) : isOTPRequired ? (
                "Verify OTP"
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
                  <span className="px-2 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>
            )}

            {/* Login with Google Button */}
            {!isOTPRequired && (
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading || authLoading}
                className="w-full flex items-center border justify-center bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200/70 focus:outline-none transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
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
                    Signing in with Google...
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
              Copyright © 2025 - ABY HR
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeLogin;