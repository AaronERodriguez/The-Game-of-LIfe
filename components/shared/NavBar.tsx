import Link from 'next/link'
import React from 'react'

type Props = {}

const NavBar = (props: Props) => {
  return (
    <div className='w-full flex h-10 px-10 flex-row justify-between bg-primary items-center'>
        <Link href='../' className='text-xl font-mono text-shadow-border text-shadow-lg hover:scale-125 transition-transform duration-200 '>
            NavBar
        </Link>
    </div>
  )
}

export default NavBar