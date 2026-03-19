import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useApp } from "@/context/AppContext";
import BottomNav from "@/components/BottomNav";
import { SplashScreen, LanguageSelectScreen, OnboardingScreen } from "@/features/onboarding";

const Index = () => {
  const { hasSeenOnboarding, hasSelectedLanguage, completeLanguageSelection } = useApp();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 1800);
    return () => clearTimeout(timer);
  }, []);

  if (showSplash) return <SplashScreen />;
  if (!hasSelectedLanguage) return <LanguageSelectScreen onComplete={completeLanguageSelection} />;
  if (!hasSeenOnboarding) return <OnboardingScreen />;

  return (
    <>
      <Outlet />
      <BottomNav />
    </>
  );
};

export default Index;
