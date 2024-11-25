"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"; // Assuming you have these components

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const InstallPWA: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const checkStandaloneMode = () => {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes("android-app://");

      setIsStandalone(isStandalone);
    };

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Check if beforeinstallprompt is supported
    setIsInstallable("beforeinstallprompt" in window);

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt as EventListener,
    );

    // Check initial state
    checkStandaloneMode();

    // Set up a listener for changes in display mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    mediaQuery.addListener(checkStandaloneMode);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt as EventListener,
      );
      mediaQuery.removeListener(checkStandaloneMode);
    };
  }, []);

  const handleInstallClick = useCallback(async () => {
    if (!deferredPrompt) {
      setInstallError("Installation prompt not available");
      return;
    }

    setIsInstalling(true);
    setInstallError(null);

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        console.log("User accepted the install prompt");
        setInstallSuccess(true);
      } else {
        console.log("User dismissed the install prompt");
      }
    } catch (error) {
      console.error("Failed to show prompt:", error);
      setInstallError("Failed to install the app. Please try again later.");
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
      setIsInstallable(false);
    }
  }, [deferredPrompt]);

  return (
    <section className="flex justify-center w-full py-6 bg-gray-100 rounded-lg my-4">
      <div className="container grid items-center justify-center gap-3 px-4 text-center md:px-6">
        {!isStandalone ? (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                Install Our App
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 text-sm md:text-base">
                Get a faster experience with offline capabilities by installing our app to your device.
              </p>
            </div>
            {isInstallable && deferredPrompt && (
              <Button
                size="lg"
                className="bg-gray-900 text-gray-50 hover:bg-gray-900/90 disabled:opacity-50"
                onClick={handleInstallClick}
                disabled={isInstalling}
                aria-label="Install Progressive Web App"
              >
                {isInstalling ? "Installing..." : "Install Now"}
              </Button>
            )}
            {!isInstallable && (
              <p className="text-yellow-600 text-sm">
                PWA installation is not supported in your current browser or the app is already installed.
              </p>
            )}
            {installError && (
              <Alert variant="destructive">
                <AlertTitle>Installation Error</AlertTitle>
                <AlertDescription>{installError}</AlertDescription>
              </Alert>
            )}
            {installSuccess && (
              <Alert>
                <AlertTitle>Installation Successful</AlertTitle>
                <AlertDescription>
                  The app has been successfully installed. You can now access it
                  from your home screen.
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl">
                Welcome to Our PWA!
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-500 text-sm md:text-base">
                You are using the installed version of our app. Enjoy the enhanced experience!
              </p>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default InstallPWA;
