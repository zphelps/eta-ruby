"use client";

import { Disclosure, DisclosureButton, DisclosurePanel } from '@headlessui/react'
import { Bars3Icon, BellIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { Download, Eye, MoreHorizontal } from "lucide-react";
import { NotebookSelector } from "@/components/editor/notebook-selector";
import { FC } from "react";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import { AccountDropdown } from "@/components/editor/account-dropdown";
import toast from "react-hot-toast";
import { validate } from "uuid";

interface EditorHeaderProps {
    notebook_id?: string;
}

export const EditorHeader: FC<EditorHeaderProps> = (props) => {
    const { notebook_id } = props;

    function downloadFile(url: string, fileName: string) {
        fetch(url)
            .then(response => response.blob())
            .then(blob => {
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);
            })
            .catch(error => console.error('Download error:', error));
    }

    const handleDownload = async () => {
        console.log('Downloading notebook...');
        if (!notebook_id) {
            toast.error('No notebook selected');
            return;
        }

        const url = `https://storage.googleapis.com/eta-ruby-notebooks/${notebook_id}/preview.pdf`
        // @ts-ignore
        downloadFile(url, `${notebook_id}.pdf`);
    }

    return (
        <Disclosure as="nav" className="absolute bg-white border-b border-b-slate-200 w-full">
            <div className="mx-auto sm:px-3 lg:px-3">
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
                        <NotebookSelector notebook_id={notebook_id} />
                    </div>
                    <div className="flex items-center">
                        <div className={"flex items-center space-x-2"}>
                            {notebook_id && validate(notebook_id) && <div className="flex-shrink-0">
                                <Link
                                    href={`/preview/${notebook_id}`}
                                    target={"_blank"}
                                    // onClick={handlePreview}
                                    // type="button"
                                    className="relative inline-flex items-center gap-x-3 rounded-lg bg-sky-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600"
                                >
                                    <Eye aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                                    Preview
                                </Link>
                            </div>}
                            {notebook_id && validate(notebook_id) && <button
                                onClick={handleDownload}
                                type="button"
                                className="relative inline-flex items-center gap-x-3 rounded-lg bg-slate-200 px-3.5 py-2 text-sm font-semibold text-black hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                            >
                                <Download aria-hidden="true" className="-ml-0.5 h-5 w-5" />
                                Download
                            </button>}
                            <AccountDropdown>
                                <button
                                    type="button"
                                    className="relative inline-flex items-center gap-x-3 rounded-lg bg-slate-200 px-3.5 py-2 text-sm font-semibold text-black hover:bg-slate-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-600"
                                >
                                    <MoreHorizontal aria-hidden="true" className="h-5 w-5" />
                                </button>
                            </AccountDropdown>
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
