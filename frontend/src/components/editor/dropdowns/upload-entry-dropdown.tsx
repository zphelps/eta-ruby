
import { FC, useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Layers, MoreHorizontal, StickyNote, Trash } from "lucide-react";
import * as React from "react";
import { DeleteEntryDialog } from "@/components/editor/dialogs/delete-entry-dialog";
import { UploadSingleEntryDialog } from "@/components/editor/dialogs/UploadSingleEntryDialog";
import { UploadMultipleEntriesDialog } from "@/components/editor/dialogs/upload-multiple-entries-dialog";

interface UploadEntryDropdownProps {
    notebook_id?: string,
    children: React.ReactNode;
}

export const UploadEntryDropdown: FC<UploadEntryDropdownProps> = (props) => {
    const { children, notebook_id } = props;

    const [dialogMenu, setDialogMenu] = useState<string>("none");

    const handleDialogMenu = (): JSX.Element | null => {
        switch (dialogMenu) {
            case "single":
                return <UploadSingleEntryDialog
                    notebook_id={notebook_id}
                    setDialogMenu={setDialogMenu}
                />;
            case "mutiple":
                return <UploadMultipleEntriesDialog
                    notebook_id={notebook_id}
                    setDialogMenu={setDialogMenu}
                />;
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
                    {children}
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Select Upload Method</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem
                            onSelect={() => {
                                console.log("Single Entry");
                                setDialogMenu("single")
                            }}
                        >
                            <StickyNote className="w-5 h-5 mr-3" />
                            Single Entry
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onSelect={() => {
                                console.log("Multiple Entries");
                                setDialogMenu("mutiple")
                            }}
                        >
                            <Layers className="w-5 h-5 mr-3" />
                            Multiple Entries
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            {handleDialogMenu()}
        </Dialog>
    );
}
