'use client'

import {useEffect} from 'react'

// import AOS from 'aos'
// import 'aos/dist/aos.css'

// import Footer from '@/components/marketing/footer'
import Header from "@/components/marketing/header";

export default function MarketingLayout({
                                          children,
                                      }: {
    children: React.ReactNode
}) {

    useEffect(() => {
        // AOS.init({
        //     once: true,
        //     disable: false,
        // })
    })

    return (
        <>
            <main className="grow">
                {children}
            </main>
        </>
    )
}
