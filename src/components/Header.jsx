"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
    {
        title : "Home" ,
        url : "/" ,
    },
    {
        title : "About" ,
        url : "/about" ,
    },
    {
        title : "SignIn" ,
        url : "/signIn" ,
    },
]

const Header = () => {
    const pathname = usePathname();
  return (
    <header >
      <div className=' flex items-center justify-between bg-gradient-to-r from-blue-400 to-pink-400 py-2 px-20'>
        <span className=' text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-800 to-pink-800 hover:from-blue-600 hover:to-pink-600'>AuthApp</span>
        <nav>
            <ul className=' flex items-center justify-center gap-4 '>
                { links.map((link)=> {
                    return (
                        <Link href={link.url} className={`hover:text-gray-500 font-bold ${ pathname === link.url ? " text-white" : " "}`}>{link.title}</Link>
                    )
                })}
            </ul>
        </nav>
      </div>
    </header>
  )
}

export default Header
