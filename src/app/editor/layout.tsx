import AuthGuard from "@/guards/auth-guard";
import DashboardHeader from "@/components/editor/header";

export default async function DashboardLayout({children}: {children: React.ReactNode}) {

    return (
        <AuthGuard>
            <DashboardHeader/>
            {children}
        </AuthGuard>
    );
}
