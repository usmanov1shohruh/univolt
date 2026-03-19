import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider } from "@/context/AppContext";
import { I18nProvider } from "@/lib/i18n";
import Index from "./pages/Index.tsx";
import MapRoute from "./pages/MapRoute";
import FavoritesRoute from "./pages/FavoritesRoute";
import SettingsRoute from "./pages/SettingsRoute";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <I18nProvider>
        <AppProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Index />}>
                <Route index element={<MapRoute />} />
                <Route path="favorites" element={<FavoritesRoute />} />
                <Route path="settings" element={<SettingsRoute />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </I18nProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
