import {FC, ReactNode} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useAuth} from "@/hooks/useAuth";
import {useRouter} from "next/navigation";

interface AccountDropdownProps {
    children: ReactNode;
}

export const AccountDropdown:FC<AccountDropdownProps> = (props) => {
    const {children} = props;

    const {user, signOut} = useAuth();

    const router = useRouter();

    const handleBilling = () => {
        console.log('Billing');
    }

    const handleLogOut = async () => {
        console.log('Log out');

        router.replace('/editor');

        await signOut();

    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
                <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
                {/*<DropdownMenuSeparator />*/}
                {/*<DropdownMenuGroup>*/}
                {/*    <DropdownMenuItem>*/}
                {/*        Billing*/}
                {/*    </DropdownMenuItem>*/}
                {/*    <DropdownMenuItem>*/}
                {/*        Settings*/}
                {/*    </DropdownMenuItem>*/}
                {/*</DropdownMenuGroup>*/}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogOut}>
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
