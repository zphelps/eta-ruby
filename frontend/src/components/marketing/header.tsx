import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {ArrowRight, CreditCard, LogOut, RocketIcon} from 'lucide-react';
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
import {Bars3Icon, XMarkIcon} from "@heroicons/react/24/outline";
import {Dialog, DialogPanel} from "@headlessui/react";

const navigation = [
    {name: 'Features', href: '#features_section'},
    {name: 'Pricing', href: '#pricing_section'},
    // {name: 'Testimonials', href: '#testimonials_section'},
    {name: 'FAQs', href: '#faq_section'},
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const {isInitialized, isAuthenticated, signInWithGoogle} = useAuth();

    return (
        <header className="bg-white">
            <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center justify-between gap-x-6 p-6 lg:px-8">
                <div className="flex lg:flex-1">
                    <Link href="#" className="-m-1.5 p-1.5 flex gap-4">
                        {/*<span className="sr-only">Your Company</span>*/}
                        {/*<img alt="" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600" className="h-8 w-auto" />*/}
                        <RocketIcon size={36}/>
                        <p className="font-bold text-2xl">EngScribe</p>
                    </Link>
                </div>
                <div className="hidden lg:flex lg:gap-x-12">
                    {navigation.map((item) => (
                        <Link key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-gray-900">
                            {item.name}
                        </Link>
                    ))}
                </div>
                <div className="flex flex-1 items-center justify-end gap-x-6">
                    <Link href={isAuthenticated ? "#" : "/editor"} className="hidden lg:block lg:text-sm lg:font-semibold lg:leading-6 lg:text-gray-900">
                        {isAuthenticated ? null : "Log in"}
                    </Link>
                    <Link
                        href={isAuthenticated ? "/editor":"#"}
                        className="flex gap-1 items-center rounded-md hover:bg-blue-500 bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                        {isAuthenticated ? "Dashboard" : "Sign up"}
                        {isAuthenticated ? (
                            <span>
                                <ArrowRight size={20}/>
                            </span>
                        ) : null}
                    </Link>
                </div>
                <div className="flex lg:hidden">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
                    >
                        <span className="sr-only">Open main menu</span>
                        <Bars3Icon aria-hidden="true" className="h-6 w-6" />
                    </button>
                </div>
            </nav>
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                <div className="fixed inset-0 z-10" />
                <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white pl-16 pr-16 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="flex items-center gap-x-6">
                        <Link href="#" className="-m-1.5 p-1.5">
                            <span className="sr-only">EngScribe</span>
                            <RocketIcon size={36}/>
                        </Link>

                        {isAuthenticated && (
                            <Link
                                href="/editor"
                                className="ml-auto rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 items-center flex gap-1"
                            >
                                Dashboard
                                <span>
                                    <ArrowRight/>
                                </span>
                            </Link>
                        )}

                        {!isAuthenticated && (
                            <Link
                                href="#"
                                className="ml-auto rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            >
                                Sign up
                            </Link>
                        )}

                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="-m-2.5 rounded-md p-2.5 text-gray-700"
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                            {!isAuthenticated && (
                                <div className="py-6">
                                    <a
                                        href="#"
                                        className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50"
                                    >
                                        Log in
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogPanel>
            </Dialog>
        </header>
    );
}
