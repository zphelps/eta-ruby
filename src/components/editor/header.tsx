"use client";
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { PlusIcon } from '@heroicons/react/20/solid'
import {useAuth} from "@/hooks/useAuth";
import {Eye} from "lucide-react";
import {NotebookSelector} from "@/components/editor/notebook-selector";
import {useSearchParams} from "next/navigation";

export default function DashboardHeader() {

    const {signOut} = useAuth();

    return (
        <Disclosure as="nav" className="absolute bg-white border-b border-b-slate-200 w-full">
            <div className="mx-auto px-2 sm:px-3 lg:px-4">
                <div className="flex h-14 justify-between">
                    <div className="flex items-center gap-x-6">
                        <div className="-ml-2 mr-2 flex items-center md:hidden">
                            {/* Mobile menu button */}
                            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500">
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Open main menu</span>
                                <Bars3Icon aria-hidden="true" className="block h-6 w-6 group-data-[open]:hidden" />
                                <XMarkIcon aria-hidden="true" className="hidden h-6 w-6 group-data-[open]:block" />
                            </DisclosureButton>
                        </div>
                        <div className="flex flex-shrink-0 items-center">
                            <img
                                alt="Your Company"
                                src="https://tailwindui.com/img/logos/mark.svg?color=sky&shade=600"
                                className="h-8 w-auto"
                            />
                        </div>

                        <NotebookSelector/>
                        {/*<div className="hidden md:ml-6 md:flex md:space-x-8">*/}
                        {/*    /!* Current: "border-sky-500 text-gray-900", Default: "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700" *!/*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="inline-flex items-center border-b-2 border-sky-500 px-1 pt-1 text-sm font-medium text-gray-900"*/}
                        {/*    >*/}
                        {/*        Dashboard*/}
                        {/*    </a>*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"*/}
                        {/*    >*/}
                        {/*        Team*/}
                        {/*    </a>*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"*/}
                        {/*    >*/}
                        {/*        Projects*/}
                        {/*    </a>*/}
                        {/*    <a*/}
                        {/*        href="#"*/}
                        {/*        className="inline-flex items-center border-b-2 border-transparent px-1 pt-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700"*/}
                        {/*    >*/}
                        {/*        Calendar*/}
                        {/*    </a>*/}
                        {/*</div>*/}
                    </div>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <button
                                type="button"
                                className="relative inline-flex items-center gap-x-3 rounded-lg bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                            >
                                <Eye aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                                Preview
                            </button>
                        </div>
                        <div className="hidden md:ml-4 md:flex md:flex-shrink-0 md:items-center">
                            {/*<button*/}
                            {/*    type="button"*/}
                            {/*    className="relative rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"*/}
                            {/*>*/}
                            {/*    <span className="absolute -inset-1.5" />*/}
                            {/*    <span className="sr-only">View notifications</span>*/}
                            {/*    <BellIcon aria-hidden="true" className="h-6 w-6" />*/}
                            {/*</button>*/}

                            {/* Profile dropdown */}
                            <Menu as="div" className="relative ml-3">
                                <div>
                                    <MenuButton className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2">
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">Open user menu</span>
                                        <img
                                            alt=""
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            className="h-8 w-8 rounded-full"
                                        />
                                    </MenuButton>
                                </div>
                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:transform data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-75 data-[enter]:ease-out data-[leave]:ease-in"
                                >
                                    <MenuItem>
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                                            Your Profile
                                        </a>
                                    </MenuItem>
                                    <MenuItem>
                                        <a href="#" className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                                            Settings
                                        </a>
                                    </MenuItem>
                                    <MenuItem>
                                        <button onClick={async () => {
                                            await signOut()
                                        }} className="block px-4 py-2 text-sm text-gray-700 data-[focus]:bg-gray-100">
                                            Sign out
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        </div>
                    </div>
                </div>
            </div>

            <DisclosurePanel className="md:hidden">
                <div className="space-y-1 pb-3 pt-2">
                    {/* Current: "bg-sky-50 border-sky-500 text-sky-700", Default: "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700" */}
                    <DisclosureButton
                        as="a"
                        href="#"
                        className="block border-l-4 border-sky-500 bg-sky-50 py-2 pl-3 pr-4 text-base font-medium text-sky-700 sm:pl-5 sm:pr-6"
                    >
                        Dashboard
                    </DisclosureButton>
                    <DisclosureButton
                        as="a"
                        href="#"
                        className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                    >
                        Team
                    </DisclosureButton>
                    <DisclosureButton
                        as="a"
                        href="#"
                        className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                    >
                        Projects
                    </DisclosureButton>
                    <DisclosureButton
                        as="a"
                        href="#"
                        className="block border-l-4 border-transparent py-2 pl-3 pr-4 text-base font-medium text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700 sm:pl-5 sm:pr-6"
                    >
                        Calendar
                    </DisclosureButton>
                </div>
                <div className="border-t border-gray-200 pb-3 pt-4">
                    <div className="flex items-center px-4 sm:px-6">
                        <div className="flex-shrink-0">
                            <img
                                alt=""
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                className="h-10 w-10 rounded-full"
                            />
                        </div>
                        <div className="ml-3">
                            <div className="text-base font-medium text-gray-800">Tom Cook</div>
                            <div className="text-sm font-medium text-gray-500">tom@example.com</div>
                        </div>
                        <button
                            type="button"
                            className="relative ml-auto flex-shrink-0 rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                        >
                            <span className="absolute -inset-1.5" />
                            <span className="sr-only">View notifications</span>
                            <BellIcon aria-hidden="true" className="h-6 w-6" />
                        </button>
                    </div>
                    <div className="mt-3 space-y-1">
                        <DisclosureButton
                            as="a"
                            href="#"
                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                        >
                            Your Profile
                        </DisclosureButton>
                        <DisclosureButton
                            as="a"
                            href="#"
                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                        >
                            Settings
                        </DisclosureButton>
                        <DisclosureButton
                            as="a"
                            href="#"
                            className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 sm:px-6"
                        >
                            Sign out
                        </DisclosureButton>
                    </div>
                </div>
            </DisclosurePanel>
        </Disclosure>
    )
}
