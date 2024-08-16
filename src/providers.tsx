'use client';

import {AuthConsumer, AuthProvider} from "@/context/auth-context";
import {Toaster} from "@/components/ui/toaster";
import {Toaster as HotToaster} from "react-hot-toast";
import {AuthContextType} from "@/context/auth-context";
import StoreProvider from "@/app/StoreProvider";

export function Providers({children}: {children: React.ReactNode}) {
    return (
        <AuthProvider>
            <AuthConsumer>
                {(auth: AuthContextType) => {
                    const showSlashScreen = !auth.isInitialized;
                    if (showSlashScreen) return <div>Loading...</div>;
                    return <>
                        <StoreProvider>
                                {children}
                        </StoreProvider>
                        <Toaster />
                        <HotToaster />
                    </>
                }}
            </AuthConsumer>
        </AuthProvider>
    );
}
