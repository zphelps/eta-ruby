import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {CreditCard, LogOut, RocketIcon} from 'lucide-react';
import {useAuth} from '@/hooks/useAuth';
import Link from 'next/link';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const navigation = [
    {name: 'Docs', href: '/'},
    {name: 'Features', href: '#features_section'},
    {name: 'Pricing', href: '#pricing_section'},
    {name: 'Testimonials', href: '#testimonials_section'},
];

export default function Header() {
    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const {isInitialized, isAuthenticated, signInWithGoogle} = useAuth();

    return (
        <header className="p-4 flex items-center justify-between">
            <div className="flex space-x-4">
                <RocketIcon size={36}/>
                <p className="font-bold text-2xl">NextLaunch</p>
            </div>

            <div className="flex items-center space-x-4 sm:hidden">
                <button
                    onClick={() => setMenuOpen(!menuOpen)}
                    className="text-gray-200 focus:outline-none"
                >
                    {/* Mobile menu button icon */}
                    {menuOpen ? (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    ) : (
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M4 6h16M4 12h16m-7 6h7"
                            />
                        </svg>
                    )}
                </button>
            </div>

            <nav className="hidden sm:flex space-x-10 items-center">
                {navigation.map((item) => (
                    <a key={item.name} href={item.href}>
                        {item.name}
                    </a>
                ))}
                {/* Profile Avatar Dropdown */}
                {/*<DropdownMenu>*/}
                {/*    <DropdownMenuTrigger>*/}
                {/*        <Avatar className={'hidden sm:flex'}>*/}
                {/*            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>*/}
                {/*            <AvatarFallback>CN</AvatarFallback>*/}
                {/*        </Avatar>*/}
                {/*    </DropdownMenuTrigger>*/}
                {/*    <DropdownMenuContent side={'bottom'} align={'end'}>*/}
                {/*        <DropdownMenuLabel>Account</DropdownMenuLabel>*/}
                {/*        <DropdownMenuSeparator/>*/}
                {/*        <DropdownMenuItem>*/}
                {/*            <CreditCard size={18} className={'mr-4'}/>*/}
                {/*            Billing*/}
                {/*        </DropdownMenuItem>*/}
                {/*        <DropdownMenuItem*/}
                {/*        >*/}
                {/*            <LogOut size={18} className={'mr-4 text-red-500'}/>*/}
                {/*            <p className={'text-red-500 font-medium'}>*/}
                {/*                Log Out*/}
                {/*            </p>*/}
                {/*        </DropdownMenuItem>*/}
                {/*    </DropdownMenuContent>*/}
                {/*</DropdownMenu>*/}
            </nav>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="absolute top-16 left-0 w-full bg-white shadow-md sm:hidden">
                    <nav className="flex flex-col items-center space-y-4 py-4">
                        {navigation.map((item) => (
                            <Link key={item.name} href={item.href}>
                                {item.name}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}


        </header>
    );
}
