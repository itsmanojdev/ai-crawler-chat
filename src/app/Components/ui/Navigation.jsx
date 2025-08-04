import Link from "next/link";
import Logo from "../Logo";
import NavLink from '../NavLink';

export default function Navigation() {
    return (
        <nav className="bg-sky-900 text-white shadow-md text-lg">
            <div className="mx-auto h-[48px] flex px-8 md:px-16">
                <div className="flex gap-8">
                    <Link href="/" className="animate">
                        <Logo className="text-white" />
                    </Link>
                    <div className="flex gap-4">
                        <NavLink href="/" text="Home" />
                        <NavLink href="/chat" text="Chat" />
                        <NavLink href="/user" text="User" />
                    </div>
                </div>
            </div>
        </nav>
    )
}