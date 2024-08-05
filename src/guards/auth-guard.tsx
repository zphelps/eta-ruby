"use client";
import { ReactNode } from "react";
import {redirect} from "next/navigation";
import {config} from "@/config";
import {useAuth} from "@/hooks/useAuth";

export default function AuthGuard({
                                                children,
                                            }: {
    children: ReactNode;
}) {
    const {user} = useAuth();

    if (!user) {
        const searchParams = new URLSearchParams({
            returnTo: window.location.pathname + window.location.search,
        }).toString();
        redirect(config.auth.signinUrl + `?${searchParams}`);
    }

    return (<>{children}</>);
}
