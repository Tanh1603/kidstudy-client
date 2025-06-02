"use client";

import {
  ClerkLoaded,
  ClerkLoading,
  SignInButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const Header = () => {

  return (
    <>
      <header
        className={cn(
          "h-20 w-full border-b-2 border-slate-200 px-4 bg-yellow-100"
        )}
      >
        <div className="mx-auto flex h-full items-center justify-between lg:max-w-screen-lg">
          <Link
            href="/"
            className="flex items-center justify-center gap-x-3 pb-7 pl-4 pt-8"
          >
            <Image src="/bee.png" alt="Mascot" height={40} width={40} />

            <h1 className="text-2xl font-extrabold tracking-wide text-yellow-600">
              KIDSTUDY
            </h1>
          </Link>

          <div className="flex gap-x-3">
            <ClerkLoading>
              <Loader className="h-5 w-5 animate-spin text-muted-foreground" />
            </ClerkLoading>
            <ClerkLoaded>
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>

              <SignedOut>
                <SignInButton
                  mode="modal"
                  afterSignInUrl="/auth"
                  afterSignUpUrl="/auth"
                >
                  <Button size="lg" variant="login">
                    Login
                  </Button>
                </SignInButton>
              </SignedOut>
            </ClerkLoaded>
          </div>
        </div>
      </header>
    </>
  );
};
