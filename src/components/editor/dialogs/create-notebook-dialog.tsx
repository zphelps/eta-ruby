"use client"

import * as React from "react"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { EntryUploader } from "@/components/editor/entry-uploader"
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Calendar} from "@/components/ui/calendar";
import {CalendarIcon, Check, ChevronsUpDown, Plus} from "lucide-react";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {format} from "date-fns";
import {cn} from "@/lib/utils";
import {Separator} from "@/components/ui/separator";
import {redirect, useSearchParams} from "next/navigation";
import {api} from "@/lib/api";
import {FC, useState} from "react";
import toast from "react-hot-toast";
import {v4 as uuid} from "uuid";
import {setEntry} from "@/slices/entries";
import {useAppDispatch} from "@/store";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator
} from "@/components/ui/command";
import {useUserTeams} from "@/hooks/useUserTeams";
import {useAuth} from "@/hooks/useAuth";
import {CreateTeamDialog} from "@/components/editor/dialogs/create-team-dialog";
import {addNotebookForUser} from "@/slices/notebooks";

const formSchema = z.object({
    title: z.string().min(3, "Notebook title must be at least 3 characters.").max(100, "Notebook title cannot be more than 100 characters."),
    team_id: z.string(),
})

interface CreateNotebookDialogProps {
    setShowDialog: (value: boolean) => void;
}

const teams = [
    { label: "6842Z - PigPen", value: "en" },
    { label: "6842G - Ghost Code", value: "fr" },
    { label: "6842C - Cobra Kai", value: "de" },
] as const

export const CreateNotebookDialog: FC<CreateNotebookDialogProps> = (props) => {
    const {setShowDialog} = props
    const [uploading, setUploading] = useState(false)
    const dispatch = useAppDispatch();
    const {user} = useAuth();

    const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false)

    const teams = useUserTeams(user?.id || "");

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            team_id: "",
        },
    })

    const searchParams = useSearchParams();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)

        setUploading(true)

        const notebookId = searchParams.get("notebook");

        if (!notebookId) {
            //TODO: Handle error
            setUploading(false)
            toast.error("Notebook not found")
            return;
        }

        try {
            const id = uuid();

            const {data} = await toast.promise(api.post("/notebooks", {
                id,
                title: values.title,
                team_id: values.team_id,
            }), {
                loading: "Creating notebook...",
                success: () => {
                    form.reset({
                        title: "",
                    })
                    setUploading(false)
                    setShowDialog(false)
                    return "Notebook created"
                },
                error: (err) => {
                    setUploading(false)
                    return `Failed to create notebook: ${err.message}`
                },
            })
            dispatch(addNotebookForUser(data))
            const params = new URLSearchParams(searchParams.toString())
            params.set('notebook', id)
            params.delete('entry')
            window.history.pushState(null, '', `?${params.toString()}`)
            // redirect(`/?${params.toString()}`)
        } catch (error) {
            setUploading(false)
            toast.error("Failed to upload entry")
        }

    }

    return (
        <>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>New Notebook</DialogTitle>
                    <DialogDescription>
                        Create a new notebook to organize your entries.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            disabled={uploading}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Ex. 2024-2025 High Stakes" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The title of your notebook should be descriptive and concise.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="team_id"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Team</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    variant="outline"
                                                    role="combobox"
                                                    className={cn(
                                                        "w-full justify-between",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value
                                                        ? `${teams.find(
                                                            (team) => team.id === field.value
                                                        )?.number} - ${teams.find(
                                                            (team) => team.id === field.value
                                                        )?.name}`
                                                        : "Select team"}
                                                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="min-w-full p-0">
                                            <Command>
                                                <CommandInput placeholder="Search teams..." />
                                                <CommandList>
                                                    <CommandEmpty>No teams found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {teams.map((team) => (
                                                            <CommandItem
                                                                value={team.name}
                                                                key={team.id}
                                                                onSelect={() => {
                                                                    form.setValue("team_id", team.id)
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        team.id === field.value
                                                                            ? "opacity-100"
                                                                            : "opacity-0"
                                                                    )}
                                                                />
                                                                {team.number} - {team.name}
                                                            </CommandItem>
                                                        ))}
                                                        <CommandSeparator className={'my-1'} />
                                                        <CommandItem>
                                                            <Dialog open={showCreateTeamDialog} onOpenChange={o => setShowCreateTeamDialog(o)}>
                                                                <DialogTrigger className={'flex items-center'}>
                                                                    <Plus size={16} className={'mr-2'} />
                                                                    New Team
                                                                </DialogTrigger>
                                                                <CreateTeamDialog setShowDialog={setShowCreateTeamDialog} />
                                                            </Dialog>
                                                        </CommandItem>
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        This is the team that will be associated with this notebook.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Separator />
                        <Button disabled={uploading || !user} type="submit">Create</Button>
                    </form>
                </Form>
            </DialogContent>
        </>
    )
}
