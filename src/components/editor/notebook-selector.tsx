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
import {ArrowDown, ChevronDown, NotebookIcon, Plus} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {usePathname, useRouter, useSearchParams} from "next/navigation";

interface NotebookSelectorProps {

}

export const NotebookSelector:FC<NotebookSelectorProps> = () => {

    const [notebooks, setNotebooks] = useState<Notebook[]>([])
    const {user} = useAuth();
    const searchParams = useSearchParams();

    async function fetchNotebooks() {
        const response = await api.get("/notebooks", {
            params: {
                team_id: user?.team_id
            }
        });
        console.log("Notebooks", response.data);
        setNotebooks(response.data);
    }

    function onSelect(notebookId: string) {
        const params = new URLSearchParams(searchParams.toString())
        params.set('notebook', notebookId)
        window.history.pushState(null, '', `?${params.toString()}`)
    }

    useEffect(() => {
        if (user?.team_id) {
            fetchNotebooks();
        }
    }, []);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={'gap-x-0.5 pr-2.5'}>
                    {notebooks.find(n => n.id === searchParams.get('notebook'))?.title ?? "Select Notebook"}
                    <ChevronDown size={14} />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-96" side={'bottom'} align={'start'}>
                <DropdownMenuLabel>All Notebooks</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {notebooks.map(notebook => (
                        <DropdownMenuItem key={notebook.id} onClick={() => onSelect(notebook.id)}>
                            {notebook.title}
                        </DropdownMenuItem>
                    ))}
                    {notebooks.length === 0 && (
                        <div className={'py-4 text-gray-400 w-full text-sm justify-center text-center'}>
                            No Notebooks Found
                        </div>
                    )}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                    <Plus size={16} className={'mr-2'} />
                    New Notebook
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
