import Link from 'next/link'
import React from 'react'

type Props = {}

const NavBar = (props: Props) => {
  return (
    <div className='w-full flex p-3 px-10 flex-row justify-between bg-primary'>
        <Link href='../' className='text-xl font-mono text-shado  '>
            NavBar
        </Link>
    </div>
  )
}

export default NavBar