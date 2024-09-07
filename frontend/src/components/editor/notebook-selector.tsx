"use client"

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
import {Check, ChevronDown, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";
import {Dialog} from "@/components/ui/dialog";
import {CreateNotebookDialog} from "@/components/editor/dialogs/create-notebook-dialog";
import {useNotebooks} from "@/hooks/useNotebooks";
import {cn} from "@/lib/utils";
import {Notebook} from "@/types/notebook";
import {validate} from "uuid";

interface NotebookSelectorProps {
    notebook_id?: string;
}

export const NotebookSelector:FC<NotebookSelectorProps> = (props) => {
    const {notebook_id} = props;

    const {user} = useAuth();

    const [showDialog, setShowDialog] = useState(false);

    const notebooks = useNotebooks(user?.id as string, notebook_id);

    const [selectedNotebook, setSelectedNotebook] = useState<Notebook>();

    const router = useRouter();

    function onSelect(notebookId: string) {
        router.replace(`/editor/${notebookId}`)
    }

    useEffect(() => {
        if (notebook_id && notebooks.length > 0) {
            setSelectedNotebook(notebooks.find(n => n.id === notebook_id) as Notebook)
        }
    }, [notebook_id, JSON.stringify(notebooks)]);

    return (
        <Dialog open={showDialog} onOpenChange={open => setShowDialog(open)}>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className={'gap-x-2 px-1.5 pr-2.5'}>
                        {(!notebook_id || !validate(notebook_id)) && (
                            <p className={'ml-1 font-semibold text-slate-600'}>
                                Select Notebook
                            </p>
                        )}
                        {notebook_id && validate(notebook_id) && (
                            <div className={'flex items-center gap-x-2'}>
                                <p
                                    className={`text-sm font-semibold text-red-500 bg-red-50 border border-red-200 rounded-md px-2 py-0.5`}
                                >
                                    {selectedNotebook?.team_number || "---"}
                                </p>

                                <p className={"text-md font-semibold text-black"}>
                                    {selectedNotebook?.team_name || "---"}
                                </p>
                            </div>
                        )}
                        <ChevronDown size={14}/>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-96" side={"bottom"} align={"start"}>
                    <DropdownMenuLabel>All Notebooks</DropdownMenuLabel>
                    <DropdownMenuSeparator/>
                    <DropdownMenuGroup>
                    {notebooks.map(notebook => (
                            <DropdownMenuItem
                                className={cn(notebook.id === notebook_id ? 'bg-sky-50' : '', 'h-9')}
                                key={notebook.id} onClick={() => onSelect(notebook.id)}>
                            <div className={'flex items-center justify-between w-full'}>
                                    <div className={'flex items-center'}>
                                        <Check
                                            size={16}
                                            className={cn(notebook.id === notebook_id ? 'text-sky-500' : 'text-transparent', 'mr-2.5')}
                                        />
                                        <p
                                            className={cn(notebook.id === notebook_id ? 'text-sky-500 font-medium' : 'text-black')}
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
