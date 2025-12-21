"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { IoClose, IoCheckmark, IoInformationCircleOutline } from "react-icons/io5";

export default function PremiumSignUpPage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"annual" | "monthly">("annual");
  const [selectedPlan, setSelectedPlan] = useState<"basic" | "premium" | "premiumPlus">("premium");

  const handleClose = () => {
    router.back();
  };

  const pricingData = {
    annual: {
      basic: { price: "€2.93", period: "/ month", save: "SAVE 10%" },
      premium: { price: "€8.12", period: "/ month", save: "SAVE 12%" },
      premiumPlus: { price: "€36.43", period: "/ month", save: "SAVE 17%" },
      yearlyPrice: "€97.41"
    },
    monthly: {
      basic: { price: "€3.52", period: "/ month", save: "" },
      premium: { price: "€9.28", period: "/ month", save: "" },
      premiumPlus: { price: "€44.07", period: "/ month", save: "" },
      yearlyPrice: "€9.28"
    }
  };

  const currentPricing = pricingData[billingCycle];

  return (
    <div className="fixed inset-0 bg-linear-to-b from-cyan-950 to-black text-white z-50 overflow-y-auto">
      {/* Header with Close Button */}
      <div className="absolute top-4 left-4 z-10">
        <button 
          onClick={handleClose}
          className="p-3 hover:bg-white/10 rounded-full transition-colors"
        >
          <IoClose size={24} className="text-white" />
        </button>
      </div>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col justify-center px-8 py-16">
        <div className="max-w-6xl mx-auto w-full">
          <h1 className="text-5xl font-bold text-center mb-12 text-white">Upgrade to Premium</h1>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-16">
            <div className="bg-neutral-800 rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle("annual")}
                className={`px-8 py-3 rounded-full text-base font-medium transition-colors ${
                  billingCycle === "annual"
                    ? "bg-white text-black"
                    : "text-white hover:bg-neutral-700"
                }`}
              >
                Annual <span className="text-green-500 text-sm ml-2 font-bold">Best Value</span>
              </button>
              <button
                onClick={() => setBillingCycle("monthly")}
                className={`px-8 py-3 rounded-full text-base font-medium transition-colors ${
                  billingCycle === "monthly"
                    ? "bg-white text-black"
                    : "text-white hover:bg-neutral-700"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-3 gap-8 mb-16 max-w-6xl mx-auto">
            {/* Basic Plan */}
            <div 
              onClick={() => setSelectedPlan("basic")}
              className={`cursor-pointer bg-neutral-900/80 rounded-3xl p-8 border transition-colors ${
                selectedPlan === "basic" ? "border-2 border-sky-500" : "border border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Basic</h3>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selectedPlan === "basic" 
                    ? "bg-sky-500" 
                    : "border-2 border-neutral-600"
                }`}>
                  {selectedPlan === "basic" && <IoCheckmark className="text-white" size={16} />}
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{currentPricing.basic.price}</span>
                <span className="text-neutral-400 ml-2 text-lg">{currentPricing.basic.period}</span>
                {currentPricing.basic.save && (
                  <div className="text-green-500 text-sm font-bold mt-2">{currentPricing.basic.save}</div>
                )}
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Small reply boost</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Bookmark folders</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Highlights tab</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Edit post</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Longer posts</span>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div 
              onClick={() => setSelectedPlan("premium")}
              className={`cursor-pointer bg-neutral-900/80 rounded-3xl p-8 border transition-colors ${
                selectedPlan === "premium" ? "border-2 border-sky-500" : "border border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Premium</h3>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selectedPlan === "premium" 
                    ? "bg-sky-500" 
                    : "border-2 border-neutral-600"
                }`}>
                  {selectedPlan === "premium" && <IoCheckmark className="text-white" size={16} />}
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{currentPricing.premium.price}</span>
                <span className="text-neutral-400 ml-2 text-lg">{currentPricing.premium.period}</span>
                {currentPricing.premium.save && (
                  <div className="text-green-500 text-sm font-bold mt-2">{currentPricing.premium.save}</div>
                )}
              </div>
              <div className="mb-6">
                <p className="text-base text-neutral-400">Everything in Basic, and</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Half Ads in For You and Following</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Larger reply boost</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Get paid to post</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Checkmark</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Grok with increased limits</span>
                  <IoInformationCircleOutline className="text-neutral-500 shrink-0" size={18} />
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">X Pro, Analytics, Media Studio</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Creator Subscriptions</span>
                </div>
              </div>
            </div>

            {/* Premium+ Plan */}
            <div 
              onClick={() => setSelectedPlan("premiumPlus")}
              className={`cursor-pointer bg-neutral-900/80 rounded-3xl p-8 border transition-colors ${
                selectedPlan === "premiumPlus" ? "border-2 border-sky-500" : "border border-neutral-700"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">Premium+</h3>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                  selectedPlan === "premiumPlus" 
                    ? "bg-sky-500" 
                    : "border-2 border-neutral-600"
                }`}>
                  {selectedPlan === "premiumPlus" && <IoCheckmark className="text-white" size={16} />}
                </div>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-bold">{currentPricing.premiumPlus.price}</span>
                <span className="text-neutral-400 ml-2 text-lg">{currentPricing.premiumPlus.period}</span>
                {currentPricing.premiumPlus.save && (
                  <div className="text-green-500 text-sm font-bold mt-2">{currentPricing.premiumPlus.save}</div>
                )}
              </div>
              <div className="mb-6">
                <p className="text-base text-neutral-400">Everything in Premium, and</p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Fully ad-free</span>
                  <IoInformationCircleOutline className="text-neutral-500 shrink-0" size={18} />
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">X Handle Marketplace</span>
                  <IoInformationCircleOutline className="text-neutral-500 shrink-0" size={18} />
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Largest reply boost</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Write Articles</span>
                </div>
                <div className="flex items-center gap-3">
                  <IoCheckmark className="text-green-500 shrink-0" size={20} />
                  <span className="text-base">Radar</span>
                  <IoInformationCircleOutline className="text-neutral-500 shrink-0" size={18} />
                </div>
                <div className="mt-6 pt-6 border-t border-neutral-700">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-xl font-bold">⚡ SuperGrok</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <IoCheckmark className="text-green-500 shrink-0" size={20} />
                      <span className="text-base">Highest usage limits</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <IoCheckmark className="text-green-500 shrink-0" size={20} />
                      <span className="text-base">Early access to new features</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="max-w-3xl mx-auto text-center">
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-4">Premium</h3>
              <div className="text-5xl font-bold">{currentPricing.yearlyPrice} <span className="text-2xl font-normal text-neutral-400">/ {billingCycle === "annual" ? "year" : "month"}</span></div>
              <div className="text-lg text-neutral-400 mt-2">Billed {billingCycle === "annual" ? "annually" : "monthly"}</div>
            </div>

            <button className="w-full max-w-2xl bg-white text-black font-bold p-5 rounded-full text-xl hover:bg-neutral-200 transition-colors mb-6">
              Subscribe & Pay
            </button>

            <div className="text-sm text-neutral-500 max-w-2xl mx-auto leading-relaxed">
              By subscribing, you agree to our <span className="underline cursor-pointer">Purchaser Terms of Service</span>. Subscriptions 
              auto-renew until cancelled. <span className="underline cursor-pointer">Cancel anytime</span>, at least 24 hours prior to 
              renewal to avoid additional charges. Manage your subscription through the 
              platform you subscribed on.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
