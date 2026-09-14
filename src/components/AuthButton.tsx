import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { LogIn, UserRound } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export default function AuthButton() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getUser().then(({ data }) => {
      if (mounted) setSignedIn(Boolean(data.user));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") setSignedIn(true);
      if (event === "SIGNED_OUT") setSignedIn(false);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (signedIn) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link to="/profil">
          <UserRound className="mr-1.5 h-4 w-4" />
          Mon profil
        </Link>
      </Button>
    );
  }

  return (
    <Button asChild size="sm" variant="outline">
      <Link to="/auth">
        <LogIn className="mr-1.5 h-4 w-4" />
        Se connecter
      </Link>
    </Button>
  );
}
