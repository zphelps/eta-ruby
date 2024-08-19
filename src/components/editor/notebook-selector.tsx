import {FC, useEffect, useState} from "react";
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
import {Notebook} from "@/types/notebook";
import {api} from "@/lib/api";
import {useAuth} from "@/hooks/useAuth";
import {ArrowDown, ChevronDown, Delete, Edit, Edit2, NotebookIcon, Plus, Trash} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {Dialog} from "@/components/ui/dialog";
import {CreateNotebookDialog} from "@/components/editor/dialogs/create-notebook-dialog";
import {useNotebooks} from "@/hooks/useNotebooks";

interface NotebookSelectorProps {

}

export const NotebookSelector:FC<NotebookSelectorProps> = () => {
    const {user} = useAuth();
    const searchParams = useSearchParams();

    const [showDialog, setShowDialog] = useState(false);

    const selectedNotebookId = searchParams.get('notebook') as string;

    const notebooks = useNotebooks(user?.id as string, selectedNotebookId);

    function onSelect(notebookId: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('notebook', notebookId)
        params.delete('entry')
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    return (
        <Dialog open={showDialog} onOpenChange={open => setShowDialog(open)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={'gap-x-0.5 pr-2.5'}>
                        {notebooks.find(n => n.id === selectedNotebookId)?.title ?? "Select Notebook"}
                        <ChevronDown size={14} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96" side={'bottom'} align={'start'}>
                    <DropdownMenuLabel>All Notebooks</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {notebooks.map(notebook => (
                            <DropdownMenuItem className={'h-9'} key={notebook.id} onClick={() => onSelect(notebook.id)}>
                                <div className={'flex items-center justify-between w-full'}>
                                    {notebook.title}
                                    <div className={'flex items-center space-x-5'}>
                                        <Button variant="ghost" className={'hover:scale-110 transform transition h-fit p-0 text-gray-500 text-xs'}>
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button variant="ghost" className={'h-fit p-0 text-gray-500 text-xs'}>
                                            <Trash size={14} />
                                        </Button>
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))}
                        {notebooks.length === 0 && (
                            <div className={'py-4 text-gray-400 w-full text-sm justify-center text-center'}>
                                No Notebooks Found
                            </div>
                        )}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={_ => setShowDialog(true)}>
                        <Plus size={16} className={'mr-2'} />
                        New Notebook
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <CreateNotebookDialog setShowDialog={setShowDialog}/>
        </Dialog>
    )
}
