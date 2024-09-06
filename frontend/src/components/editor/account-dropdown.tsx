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

interface AccountDropdownProps {
    children: ReactNode;
}

export const AccountDropdown:FC<AccountDropdownProps> = (props) => {
    const {children} = props;

    const {signOut} = useAuth();

    const handleBilling = () => {
        console.log('Billing');
    }

    const handleLogOut = async () => {
        console.log('Log out');

        await signOut();

    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuLabel>Account</DropdownMenuLabel>
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
