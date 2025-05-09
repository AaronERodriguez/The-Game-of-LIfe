"use client"

import LoadingLogo from '@/components/shared/LoadingLogo'
import { ClerkProvider, useAuth } from '@clerk/nextjs'
import { Authenticated, AuthLoading, ConvexReactClient, Unauthenticated } from 'convex/react'
import { ConvexProviderWithClerk } from 'convex/react-clerk'
import React from 'react'

type Props = {
  children: React.ReactNode
}

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";

const convex = new ConvexReactClient(CONVEX_URL)

const ConvexClientProvider = ({children}: Props) => {
  return <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <AuthLoading>
            <LoadingLogo />
        </AuthLoading>
          <Authenticated>
            {children}
          </Authenticated>
          <Unauthenticated>
            {children}
          </Unauthenticated>
    </ConvexProviderWithClerk>
  </ClerkProvider>
}

export default ConvexClientProvider