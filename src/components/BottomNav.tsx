import { Map, Heart, MoreHorizontal } from 'lucide-react';
import { useI18n } from '@/lib/i18n';
import { useLocation, useNavigate } from "react-router-dom";

type Tab = 'map' | 'favorites' | 'settings';

const tabToPath: Record<Tab, string> = {
  map: "/",
  favorites: "/favorites",
  settings: "/settings",
};

function getActiveTab(pathname: string): Tab {
  if (pathname.startsWith("/favorites")) return "favorites";
  if (pathname.startsWith("/settings")) return "settings";
  return "map";
}

export default function BottomNav() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();

  const active = getActiveTab(location.pathname);
  const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
    { id: 'map', icon: Map, label: t('nav.map') },
    { id: 'favorites', icon: Heart, label: t('nav.favorites') },
    { id: 'settings', icon: MoreHorizontal, label: t('nav.settings') },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 surface-glass border-t border-border/50 z-30 safe-bottom lg:hidden">
      <div className="flex items-center justify-around py-1.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => navigate(tabToPath[tab.id])}
              className={`flex flex-col items-center gap-0.5 py-1.5 px-5 min-w-[60px] rounded-lg transition-colors ${
                isActive ? '' : 'active:bg-muted'
              }`}
            >
              <Icon className={`w-[18px] h-[18px] transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`} strokeWidth={isActive ? 2 : 1.5} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
