import Link from "next/link";

interface Tab {
  id: string;
  label: string;
  href?: string; // For Link-based navigation
  onClick?: () => void; // For state-based navigation
}

interface TabNavigationProps {
  tabs: Tab[];
  activeTab: string;
  type?: "link" | "button"; // Default to "button"
}

export default function TabNavigation({ tabs, activeTab, type = "button" }: TabNavigationProps) {
  return (
    <div className="border-b border-neutral-800">
      <div className="flex">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const baseClasses = `flex-1 text-center py-4 px-4 transition-colors relative font-medium ${
            isActive ? "text-white" : "text-neutral-500 hover:bg-neutral-900"
          }`;

          if (type === "link" && tab.href) {
            return (
              <Link key={tab.id} href={tab.href} className={baseClasses}>
                <span>{tab.label}</span>
                {isActive && (
                  <div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-sky-500 h-1 rounded-full" 
                    style={{ width: `${tab.label.length * 8}px` }}
                  />
                )}
              </Link>
            );
          }

          return (
            <button key={tab.id} onClick={tab.onClick} className={baseClasses}>
              <span>{tab.label}</span>
              {isActive && (
                <div 
                  className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-sky-500 h-1 rounded-full" 
                  style={{ width: `${tab.label.length * 8}px` }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
