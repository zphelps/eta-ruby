import {DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {api} from "@/lib/api";
import {removeEntry} from "@/slices/entries";
import toast from "react-hot-toast";
import * as React from "react";
import {useAppDispatch} from "@/store";
import {useSearchParams} from "next/navigation";
import {FC, useState} from "react";

interface DeleteEntryDialogProps {
    setDialogMenu: (value: string) => void;
}

export const DeleteEntryDialog:FC<DeleteEntryDialogProps> = (props) => {
    const { setDialogMenu } = props;

    const dispatch = useAppDispatch();
    const searchParams = useSearchParams();
    const selectedEntryId = searchParams.get("entry") as string;
    const selectedNotebookId = searchParams.get("notebook") as string;

    const [deleting, setDeleting] = useState(false);

    async function deleteEntry() {
        setDeleting(true);
        await api.delete(`/entries`, {
            params: {
                notebook_id: selectedNotebookId,
                entry_id: selectedEntryId
            }
        });
        dispatch(removeEntry(selectedEntryId));
        const params = new URLSearchParams(searchParams.toString())
        params.delete('entry')
        window.history.pushState(null, '', `?${params.toString()}`)
        setDeleting(false);
        setDialogMenu("none");
    }

    async function handleDeleteEntry() {
        await toast.promise(
            deleteEntry(),
            {
                loading: 'Deleting entry...',
                success: <b>Entry deleted</b>,
                error: <b>Could not delete.</b>,
            }
        );
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