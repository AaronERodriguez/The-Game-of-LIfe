"use client"

import { SignInButton, UserButton } from '@clerk/nextjs'
import { Authenticated, Unauthenticated } from 'convex/react'
import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ModeToggle } from './ModeToggle'

type Props = {}

const NavBar = (props: Props) => {
  return (
    <div className='w-full flex h-10 px-10 flex-row justify-between bg-primary items-center'>
        <Link href='../' className='text-xl font-mono text-shadow-border text-shadow-lg hover:scale-125 transition-transform duration-200 '>
            NavBar
        </Link>
        <div className='flex items-center gap-2'>
          <ModeToggle />
          <Authenticated>
            <UserButton />
          </Authenticated>
          <Unauthenticated>
            <SignInButton>
              <Button variant={'secondary'}>Sign In</Button>
            </SignInButton>
          </Unauthenticated>
        </div>
    </div>
  )
}

export default NavBar