'use client'

import { ModeToggle } from "@/components/shared/ModeToggle";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import Link from "next/link";

export default function Home() {

  const user = useQuery(api.user.getUser);

  return (
    <div className="w-full items-center flex flex-col gap-40">
      <h1 className="text-6xl text-center font-mono text-shadow-sm text-shadow-purple-900 ">Welcome<Authenticated>, {user?.username}</Authenticated> to The Game of Life</h1>
      <Authenticated>
        <Link href={'../dashboard'}>
          <Button className="scale-180 hover:scale-200 transition-transform duration-100 cursor-pointer" variant={'default'}>Go to Dashboard</Button>
        </Link>
      </Authenticated>
      <Unauthenticated>
        <SignUpButton>
          <Button className="scale-180 hover:scale-200 transition-transform duration-100 cursor-pointer">Start Here!</Button>
        </SignUpButton>
      </Unauthenticated>
    </div>
  );
}
