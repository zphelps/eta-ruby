'use client';

import {AuthConsumer, AuthProvider} from "@/context/auth-context";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as HotToaster} from "react-hot-toast";
import {AuthContextType} from "@/context/auth-context";
import StoreProvider from "@/app/StoreProvider";
import { Worker } from '@react-pdf-viewer/core';

export function Providers({children}: {children: React.ReactNode}) {
    return (
        <AuthProvider>
            <AuthConsumer>
                {(auth: AuthContextType) => {
                    const showSlashScreen = !auth.isInitialized;
                    if (showSlashScreen) return <div>Loading...</div>;
                    return <>
                        <StoreProvider>
                            {/*<Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">*/}
                                {children}
                            {/*</Worker>;*/}
                        </StoreProvider>
                        <Toaster />
                        <HotToaster />
                    </>
                }}
            </AuthConsumer>
        </AuthProvider>
    );
}
