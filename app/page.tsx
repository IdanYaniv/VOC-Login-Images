"use client";

import { useState } from "react";
import { ViaLogo } from "./components/via-logo";
import { LivingServiceMap } from "./components/LivingServiceMap";
import { Eye, EyeOff } from "lucide-react";

function PasswordInput({
  label,
  show,
  onToggle,
}: {
  label: string;
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex w-full flex-col gap-1">
      <label className="flex items-center gap-0.5 text-xs leading-4 text-[#42474F]">
        {label}
        <span className="text-[#22242A]">*</span>
      </label>
      <div className="flex h-9 items-center gap-1 rounded-lg border border-[#D5D7DB] bg-white px-2">
        <input
          type={show ? "text" : "password"}
          defaultValue="password123"
          className="flex-1 bg-transparent text-sm leading-5 text-[#42474F] outline-none placeholder:text-[#9BA0AA]"
        />
        <button
          type="button"
          onClick={onToggle}
          className="shrink-0 text-[#42474F]"
        >
          {show ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);

  return (
    <div className="flex h-screen w-screen bg-[#F7F8FA]">
      {/* Left Panel - Fixed 540px */}
      <div className="flex w-[540px] shrink-0 flex-col border-r border-[#C7CAD0] bg-white px-[66px] py-16">
        {/* Welcome: Logo + Heading */}
        <div className="flex w-[308px] flex-col gap-14">
          <ViaLogo />
          <h1 className="text-[36px] font-bold leading-[44px]">
            <span className="text-[#004080]">Welcome to</span>
            <br />
            <span className="text-[#00A8E2]">Via Operations Center</span>
          </h1>
        </div>

        {/* Content: Actions at top, footer links at bottom */}
        <div className="mt-14 flex w-[352px] flex-1 flex-col justify-between">
          {/* Actions */}
          <div className="flex flex-col gap-4">
            <PasswordInput
              label="New password"
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />

            <PasswordInput
              label="Confirm password"
              show={showConfirmPassword}
              onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Checkbox */}
            <div className="flex items-start gap-1">
              <button
                type="button"
                onClick={() => setAgreed(!agreed)}
                className="flex h-6 w-6 shrink-0 items-center justify-center"
              >
                <div
                  className={`flex h-4 w-4 items-center justify-center rounded-sm border ${
                    agreed
                      ? "border-[#0069E2] bg-[#0069E2]"
                      : "border-[#D5D7DB] bg-white"
                  }`}
                >
                  {agreed && (
                    <svg
                      width="10"
                      height="8"
                      viewBox="0 0 10 8"
                      fill="none"
                    >
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
              </button>
              <span className="text-sm leading-5 text-[#42474F]">
                I agree to the{" "}
                <span className="font-medium text-[#0069E2]">
                  Terms and Conditions
                </span>{" "}
                and{" "}
                <span className="font-medium text-[#0069E2]">
                  Privacy Policy
                </span>
              </span>
            </div>

            {/* Create Password Button */}
            <button
              type="button"
              className="flex h-9 w-full items-center justify-center overflow-hidden rounded-lg bg-[#0069E2] transition-colors hover:bg-[#0054B4]"
            >
              <span className="text-sm font-semibold leading-5 text-white">
                Create password
              </span>
            </button>
          </div>

          {/* Footer Links */}
          <div className="flex justify-center gap-6">
            <span className="text-xs leading-4 text-[#6C7380]">
              Terms and Conditions
            </span>
            <span className="text-xs leading-4 text-[#6C7380]">
              Privacy Policy
            </span>
          </div>
        </div>
      </div>

      {/* Right Side - Living Service Map */}
      <div className="flex-1">
        <LivingServiceMap />
      </div>
    </div>
  );
}
