"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";

interface AuthState {
  isAuthenticated: boolean;
  userId: string | null;
  guestId: string | null;
  loading: boolean;
}

export function useAuth(): AuthState {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userId: null,
    guestId: null,
    loading: true,
  });

  useEffect(() => {
    // Check if user is authenticated
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAuthState({
          isAuthenticated: true,
          userId: user.id,
          guestId: null,
          loading: false,
        });
      } else {
        // Generate or retrieve guest ID from localStorage
        let guestId = localStorage.getItem("countdown_guest_id");
        if (!guestId) {
          guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem("countdown_guest_id", guestId);
        }

        setAuthState({
          isAuthenticated: false,
          userId: null,
          guestId,
          loading: false,
        });
      }
    });

    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthState({
          isAuthenticated: true,
          userId: session.user.id,
          guestId: null,
          loading: false,
        });
      } else if (event === "SIGNED_OUT") {
        setAuthState({
          isAuthenticated: false,
          userId: null,
          guestId: localStorage.getItem("countdown_guest_id"),
          loading: false,
        });
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  return authState;
}
