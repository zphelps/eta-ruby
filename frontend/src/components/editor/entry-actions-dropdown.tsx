import {FC, useState} from "react";
import {Dialog} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal, Trash} from "lucide-react";
import * as React from "react";
import {DeleteEntryDialog} from "@/components/editor/dialogs/delete-entry-dialog";

interface EntryActionsDropdownProps {
    notebookId: string;
}

export const EntryActionsDropdown:FC<EntryActionsDropdownProps> = (props) => {
    const { notebookId } = props;
    const [dialogMenu, setDialogMenu] = useState<string>("none");

    const handleDialogMenu = (): JSX.Element | null => {
        switch (dialogMenu) {
            case "create":
                return <div></div>
            case "delete":
                return <DeleteEntryDialog setDialogMenu={setDialogMenu} notebookId={notebookId} />;
            default:
                return null;
        }
    };

    return (
        <Dialog open={dialogMenu !== "none"} onOpenChange={open => {
            if (!open) {
                setDialogMenu("none");
            }
        }}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Entry Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            className={'text-red-500'}
                            onSelect={() => {
                                console.log("Delete");
                                setDialogMenu("delete")}}
                        >
                            <Trash className={'h-5 w-5 mr-2'}/>
                            Delete
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {handleDialogMenu()}
        </Dialog>
    );
}
