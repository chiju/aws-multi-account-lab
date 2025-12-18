"use client";

import Link from "next/link";

const SubscribePremium = () => {
  
  return (
    <div className="p-3 rounded-2xl border border-neutral-800 flex flex-col gap-4">
      {/* HEADING */}
      <h2 className="font-bold text-xl">Subscribe to Premium</h2>
      
      {/* DESCRIPTION */}
      <p className="text-sm  text-white">
        Subscribe to unlock new features and, if eligible, receive a share of revenue.
      </p>

      {/* SUBSCRIBE BUTTON */}
      <Link
        href="/premium_sign_up"
        className="self-start py-2 px-3 bg-sky-500 text-white font-semibold rounded-full hover:bg-sky-600 transition-colors"
      >
        Subscribe
      </Link>
    </div>
  );
};

export default SubscribePremium;
