import Link from "next/link";
import Search from "./Search";
import WhoToFollow from "../profile/WhoToFollow";
import SubscribePremium from "./Subscribe";

const links = [
  { name: "Terms of Service", href: "/" },
  { name: "Privacy Policy", href: "/" },
  { name: "Cookie Policy", href: "/" },
  { name: "Accessibility", href: "/" },
  { name: "Ads Info", href: "/" },
];

const RightBar = () => {
  return (
    <div className="pt-1.5 flex flex-col gap-4 sticky top-0 h-max">
      <Search />
      <SubscribePremium />
      <WhoToFollow />
      <div className="text-neutral-500 text-xs pl-8 flex flex-wrap gap-x-2">
        {links.map((link, index) => (
          <span key={link.name} className="flex items-center gap-x-2">
            <Link href={link.href}>{link.name}</Link>
            {/* Add separator only if not last item */}
            {index < links.length - 1 && <span>|</span>}
          </span>
        ))}
        <span>© 2025 L Corp.</span>
      </div>
    </div>
  );
};

export default RightBar;
