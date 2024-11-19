import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { removeEntry } from "@/slices/entries";
import toast from "react-hot-toast";
import * as React from "react";
import { useAppDispatch } from "@/store";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FC, useState } from "react";

interface DeleteEntryDialogProps {
    notebookId: string;
    setDialogMenu: (value: string) => void;
}

export const DeleteEntryDialog: FC<DeleteEntryDialogProps> = (props) => {
    const { setDialogMenu, notebookId } = props;

    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;

    const pathname = usePathname();
    const { replace } = useRouter();

    const [deleting, setDeleting] = useState(false);

    const deleteEntry = () => new Promise(async (resolve, reject) => {
        try {
            const response = await api.post(`https://us-west1-eta-ruby.cloudfunctions.net/delete-entry`, {
                id: selectedEntryId
            });
            console.log(response);
            resolve(response);
        } catch (error) {
            console.error("Error deleting entry:", error);
            reject(error);
        }
    });

    async function handleDeleteEntry() {
        setDeleting(true);

        try {
            const { success, message } = await toast.promise(
                deleteEntry(),
                {
                    loading: 'Deleting entry...',
                    success: <b>Entry deleted</b>,
                    error: <b>Could not delete.</b>,
                }
            ) as { success: boolean, message: string };

            if (success) {
                dispatch(removeEntry(selectedEntryId));
                const params = new URLSearchParams(searchParams.toString());
                params.delete('entry');
                replace(pathname);
                setDialogMenu("none");
            } else {
                toast.error(message);
            }
        } catch (error) {
            toast.error("An error occurred while deleting the entry.");
        } finally {
            setDeleting(false);
        }
    }

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Delete</DialogTitle>
                <DialogDescription>
                    This action cannot be undone. Are you sure you want to permanently
                    delete this entry from your notebook?
                </DialogDescription>
            </DialogHeader>
            <DialogFooter>
                <Button type="submit" disabled={deleting} onClick={handleDeleteEntry}>Confirm</Button>
            </DialogFooter>
        </DialogContent>
    )
}
