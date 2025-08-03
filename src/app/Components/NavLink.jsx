'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavLink = ({ href, text }) => {
    const pathname = usePathname();
    let navActiveClasses = pathname === href ? " bg-sky-950/70" : "";
    return (
        <>
            <Link href={href} className={`inline-flex items-center px-6 hover:bg-sky-950/70 ${navActiveClasses} animate`}>{text}</Link>
        </>
    )
}

export default NavLink