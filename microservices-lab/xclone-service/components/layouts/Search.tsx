import Image from "next/image";

export default function Search() {
  return (
    <div className="relative w-full">
      {/* Icon inside input */}
      <div className="absolute left-3 top-1/2 -translate-y-1/2">
        <Image
          src="/icons/explore.svg"
          alt="Search"
          width={15}
          height={15}
          className="opacity-70"
        />
      </div>

      {/* Input */}
      <input
        type="text"
        placeholder="Search"
        className="
          rounded-full
          pl-8     
          pr-4
          py-3
          w-full
          text-sm
          text-white
          border
         border-neutral-800
          focus:outline-none
        "
      />
    </div>
  );
}
