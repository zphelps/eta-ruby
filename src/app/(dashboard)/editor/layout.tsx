import AuthGuard from "@/guards/auth-guard";
import DashboardHeader from "@/components/editor/editor-header";

export default function DashboardLayout({children}: {children: React.ReactNode}) {

    return (
        <AuthGuard>
            <DashboardHeader/>
            {children}
        </AuthGuard>
    );
}
