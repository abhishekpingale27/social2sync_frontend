import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FiLock, FiEye, FiEyeOff, FiLoader, FiArrowLeft } from "react-icons/fi";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../firebase/config";

// Firebase auth is used instead of API calls

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const oobCode = searchParams.get("oobCode"); // Firebase uses oobCode for reset tokens

  useEffect(() => {
    if (!oobCode) {
      toast.error("Invalid or missing reset code.");
      setTimeout(() => navigate("/auth"), 3000);
      return;
    }
    
    // Verify the action code is valid
    const verifyCode = async () => {
      try {
        await auth.verifyPasswordResetCode(oobCode);
      } catch (error) {
        console.error("Invalid reset code:", error);
        toast.error("This password reset link is invalid or has expired.");
        setTimeout(() => navigate("/auth"), 3000);
      }
    };
    
    verifyCode();
  }, [oobCode, navigate]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!newPassword) {
      toast.error("New password is required.");
      triggerShake();
      setIsLoading(false);
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      triggerShake();
      setIsLoading(false);
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      triggerShake();
      setIsLoading(false);
      return;
    }

    try {
      // Confirm the password reset with Firebase
      await auth.confirmPasswordReset(oobCode, newPassword);
      toast.success("Password has been reset successfully!");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => navigate("/auth"), 2000);
    } catch (error) {
      console.error("Password reset error:", error);
      if (error.code === "auth/weak-password") {
        toast.error("Password is too weak. Please use a stronger password.");
      } else if (error.code === "auth/expired-action-code") {
        toast.error("This password reset link has expired. Please request a new one.");
      } else if (error.code === "auth/invalid-action-code") {
        toast.error("This password reset link is invalid. Please request a new one.");
      } else {
        toast.error("Failed to reset password. Please try again.");
      }
      triggerShake();
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-indigo-500 to-blue-500"></div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={`px-8 py-8 ${shake ? "animate-shake" : ""}`}
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800">Set New Password</h2>
              <p className="text-gray-500 mt-2">
                Enter your new password below.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="New Password"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <FiEye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </motion.div>
              
              <motion.div variants={itemVariants}>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    placeholder="Confirm Password"
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isLoading || !oobCode}
                  className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200 ${isLoading || !oobCode ? "opacity-75 cursor-not-allowed" : ""}`}
                >
                  {isLoading ? (
                    <>
                      <FiLoader className="animate-spin mr-2 h-4 w-4" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <FiLock className="mr-2 h-4 w-4" />
                      Reset Password
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            <motion.div variants={itemVariants} className="mt-6">
              <button
                type="button"
                onClick={() => navigate("/auth")}
                className="w-full flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                <FiArrowLeft className="mr-2 h-4 w-4" />
                Back to Login
              </button>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default ResetPassword;