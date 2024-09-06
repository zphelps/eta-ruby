import AuthGuard from "@/guards/auth-guard";
import EditorHeader from "@/components/editor/editor-header";

export default function DashboardLayout({children}: {children: React.ReactNode}) {

    return (
        <AuthGuard>
            {/*<DashboardHeader/>*/}
            {children}
        </AuthGuard>
    );
}
