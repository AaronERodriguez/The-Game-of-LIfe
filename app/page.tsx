'use client'

import { ModeToggle } from "@/components/shared/ModeToggle";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated } from "convex/react";

export default function Home() {
  return (
    <div>
    <Authenticated>
      <UserButton />
    </Authenticated>
    <Unauthenticated>
      <SignInButton>
        <Button>Sign In</Button>
      </SignInButton>
    </Unauthenticated>
    <ModeToggle />
    </div>
  );
}
