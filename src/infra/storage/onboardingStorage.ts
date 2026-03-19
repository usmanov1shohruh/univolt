const ONBOARDING_KEY = "univolt-onboarding";

export function loadOnboardingSeen(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === "done";
  } catch {
    return false;
  }
}

export function saveOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, "done");
  } catch {
    // ignore write errors
  }
}

