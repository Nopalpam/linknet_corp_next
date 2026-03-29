"use client";
import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { authService } from "@/services/auth.service";
import { useRouter } from "next/navigation";

const MfaSetupPage = () => {
  const { user, isAuthenticated, isAuthValidated, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const router = useRouter();
  
  const [step, setStep] = useState<"loading" | "status" | "setup" | "verify">("loading");
  const [qrCode, setQrCode] = useState<string>("");
  const [secret, setSecret] = useState<string>("");
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaGloballyEnabled, setMfaGloballyEnabled] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [disableOtp, setDisableOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const disableInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (isAuthValidated && !authLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isAuthValidated, authLoading, router]);

  // Load MFA status
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const loadStatus = async () => {
      try {
        const res = await authService.mfaStatus();
        if (res.success) {
          setMfaEnabled(res.data.mfaEnabled);
          setMfaGloballyEnabled(res.data.mfaGloballyEnabled);
          setStep("status");
        }
      } catch (err) {
        console.error("Failed to load MFA status:", err);
        setStep("status");
      }
    };
    loadStatus();
  }, [isAuthenticated]);

  const handleSetup = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await authService.mfaSetup();
      if (res.success) {
        setQrCode(res.data.qrCode);
        setSecret(res.data.secret);
        setStep("setup");
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string, refs: React.MutableRefObject<(HTMLInputElement | null)[]>, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (!/^\d*$/.test(value)) return;
    setter(prev => {
      const newOtp = [...prev];
      newOtp[index] = value.slice(-1);
      return newOtp;
    });
    setError("");
    if (value && index < 5) {
      refs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent, refs: React.MutableRefObject<(HTMLInputElement | null)[]>, otpState: string[]) => {
    if (e.key === "Backspace" && !otpState[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent, setter: React.Dispatch<React.SetStateAction<string[]>>, refs: React.MutableRefObject<(HTMLInputElement | null)[]>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pastedData.length === 6) {
      setter(pastedData.split(""));
      refs.current[5]?.focus();
    }
  };

  const handleEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await authService.mfaEnable(otpString);
      if (res.success) {
        toast.success("MFA has been enabled successfully!", 3000);
        setMfaEnabled(true);
        setStep("status");
        setOtp(["", "", "", "", "", ""]);
      } else {
        setError(res.message);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to enable MFA";
      setError(msg);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = disableOtp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }

    setIsLoading(true);
    setError("");
    try {
      const res = await authService.mfaDisable(otpString);
      if (res.success) {
        toast.success("MFA has been disabled", 3000);
        setMfaEnabled(false);
        setShowDisableModal(false);
        setDisableOtp(["", "", "", "", "", ""]);
      } else {
        setError(res.message);
        setDisableOtp(["", "", "", "", "", ""]);
        disableInputRefs.current[0]?.focus();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to disable MFA";
      setError(msg);
      setDisableOtp(["", "", "", "", "", ""]);
      disableInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-brand-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading MFA settings...</p>
        </div>
      </div>
    );
  }

  // OTP Input Component
  const OtpInputGroup = ({ 
    otpState, setter, refs, onPaste 
  }: { 
    otpState: string[]; 
    setter: React.Dispatch<React.SetStateAction<string[]>>; 
    refs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    onPaste: (e: React.ClipboardEvent) => void;
  }) => (
    <div className="flex justify-center gap-3" onPaste={onPaste}>
      {otpState.map((digit, index) => (
        <input
          key={index}
          ref={(el) => { refs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleOtpChange(index, e.target.value, refs, setter)}
          onKeyDown={(e) => handleOtpKeyDown(index, e, refs, otpState)}
          className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 dark:bg-gray-700 dark:text-white transition-colors"
          autoFocus={index === 0}
        />
      ))}
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
          Two-Factor Authentication (MFA)
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Add an extra layer of security to your account
        </p>
      </div>

      {!mfaGloballyEnabled && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">
            <strong>Note:</strong> MFA is currently disabled system-wide by the administrator. 
            You can still set up MFA, but it will not be required during login until the admin enables it.
          </p>
        </div>
      )}

      {/* Status View */}
      {step === "status" && (
        <div>
          <div className={`flex items-center gap-3 p-4 rounded-lg mb-6 ${
            mfaEnabled 
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          }`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              mfaEnabled ? "bg-green-100 dark:bg-green-900/40" : "bg-gray-100 dark:bg-gray-700"
            }`}>
              {mfaEnabled ? (
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286zm0 13.036h.008v.008H12v-.008z" />
                </svg>
              )}
            </div>
            <div>
              <p className={`font-medium ${mfaEnabled ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"}`}>
                {mfaEnabled ? "MFA is Enabled" : "MFA is Disabled"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {mfaEnabled
                  ? "Your account is protected with two-factor authentication"
                  : "Enable MFA to add an extra layer of security"}
              </p>
            </div>
          </div>

          {mfaEnabled ? (
            <button
              onClick={() => { setShowDisableModal(true); setError(""); setDisableOtp(["", "", "", "", "", ""]); }}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 dark:text-red-400 dark:border-red-700 dark:hover:bg-red-900/20 transition-colors"
            >
              Disable MFA
            </button>
          ) : (
            <button
              onClick={handleSetup}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
            >
              {isLoading ? "Setting up..." : "Setup MFA"}
            </button>
          )}
        </div>
      )}

      {/* Setup View - QR Code */}
      {step === "setup" && (
        <div className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Scan this QR code with your authenticator app:
            </p>
            {qrCode && (
              <div className="inline-block p-4 bg-white rounded-lg border">
                <Image src={qrCode} alt="MFA QR Code" width={192} height={192} unoptimized />
              </div>
            )}
          </div>

          {/* Manual entry secret */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Or enter this code manually:
            </p>
            <code className="text-sm font-mono bg-white dark:bg-gray-900 px-3 py-2 rounded border block text-center select-all break-all">
              {secret}
            </code>
          </div>

          <button
            onClick={() => { setStep("verify"); setOtp(["", "", "", "", "", ""]); setError(""); }}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors"
          >
            I&apos;ve scanned the QR code → Verify
          </button>

          <button
            onClick={() => setStep("status")}
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Verify View - Enter OTP to enable */}
      {step === "verify" && (
        <form onSubmit={handleEnableMfa} className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Enter the 6-digit code from your authenticator app to enable MFA:
          </p>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <OtpInputGroup
            otpState={otp}
            setter={setOtp}
            refs={inputRefs}
            onPaste={(e) => handleOtpPaste(e, setOtp, inputRefs)}
          />

          <button
            type="submit"
            disabled={isLoading || otp.join("").length !== 6}
            className="w-full px-4 py-3 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Verifying..." : "Enable MFA"}
          </button>

          <button
            type="button"
            onClick={() => setStep("setup")}
            className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
          >
            ← Back to QR Code
          </button>
        </form>
      )}

      {/* Disable MFA Modal */}
      {showDisableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
              Disable MFA
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Enter the 6-digit code from your authenticator app to confirm:
            </p>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleDisableMfa} className="space-y-6">
              <OtpInputGroup
                otpState={disableOtp}
                setter={setDisableOtp}
                refs={disableInputRefs}
                onPaste={(e) => handleOtpPaste(e, setDisableOtp, disableInputRefs)}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowDisableModal(false); setError(""); }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || disableOtp.join("").length !== 6}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isLoading ? "Disabling..." : "Disable MFA"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MfaSetupPage;
