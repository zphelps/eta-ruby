import {FC, useEffect, useState} from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {useAuth} from "@/hooks/useAuth";
import {Check, ChevronDown, Plus, Settings} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useSearchParams} from "next/navigation";
import {Dialog} from "@/components/ui/dialog";
import {CreateNotebookDialog} from "@/components/editor/dialogs/create-notebook-dialog";
import {useNotebooks} from "@/hooks/useNotebooks";
import {cn} from "@/lib/utils.ts";

interface NotebookSelectorProps {

}

export const NotebookSelector:FC<NotebookSelectorProps> = () => {
    const {user} = useAuth();
    const searchParams = useSearchParams();

    const [showDialog, setShowDialog] = useState(false);

    const selectedNotebookId = searchParams.get('notebook') as string;

    const notebooks = useNotebooks(user?.id as string, selectedNotebookId);

    const [selectedNotebook, setSelectedNotebook] = useState();

    function onSelect(notebookId: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('notebook', notebookId)
        params.delete('entry')
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    useEffect(() => {
        if (selectedNotebookId && notebooks.length > 0) {
            setSelectedNotebook(notebooks.find(n => n.id === selectedNotebookId))
        }
    }, [selectedNotebookId, JSON.stringify(notebooks)]);

    return (
        <Dialog open={showDialog} onOpenChange={open => setShowDialog(open)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={'gap-x-2 px-1.5 pr-2.5'}>
                        <p
                            className={`text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-md px-2 py-0.5`}
                        >
                            {selectedNotebook?.team_number || "---"}
                        </p>

                        <p className={'text-md font-semibold text-black'}>
                            {selectedNotebook?.team_name || "---"}
                        </p>
                        <ChevronDown size={14}/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96" side={'bottom'} align={'start'}>
                    <DropdownMenuLabel>All Notebooks</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                        {notebooks.map(notebook => (
                            <DropdownMenuItem
                                className={cn(notebook.id === selectedNotebookId ? 'bg-sky-50' : '', 'h-9')}
                                key={notebook.id} onClick={() => onSelect(notebook.id)}>
                            <div className={'flex items-center justify-between w-full'}>
                                    <div className={'flex items-center'}>
                                        <Check
                                            size={16}
                                            className={cn(notebook.id === selectedNotebookId ? 'text-sky-500' : 'text-transparent', 'mr-2.5')}
                                        />
                                        <p
                                            className={cn(notebook.id === selectedNotebookId ? 'text-sky-500 font-medium' : 'text-black')}
                                        >
                                            {notebook.team_number} - {notebook.team_name}
                                        </p>
                                    </div>
                                    <div className={'flex items-center space-x-5'}>
                                        {/*<Button variant="ghost" className={'hover:scale-110 transform transition h-fit p-0 text-gray-500 text-xs'}>*/}
                                        {/*    <Settings size={14} />*/}
                                        {/*</Button>*/}
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
                        Notebook
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
            <CreateNotebookDialog setShowDialog={setShowDialog}/>
        </Dialog>
    )
}
