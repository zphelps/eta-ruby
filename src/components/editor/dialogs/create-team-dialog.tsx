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
import {useSearchParams} from "next/navigation";
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
import {addTeamForUser} from "@/slices/teams";

const formSchema = z.object({
    name: z.string().min(1, "Team name must be at least 1 characters.").max(100, "Team name cannot be more than 100 characters."),
    number: z.string().min(1, "Team number must be at least 1 characters.").max(100, "Team number cannot be more than 8 characters."),
})

interface CreateTeamDialogProps {
    setShowDialog: (value: boolean) => void;
}

export const CreateTeamDialog: FC<CreateTeamDialogProps> = (props) => {
    const {setShowDialog} = props
    const [uploading, setUploading] = useState(false)
    const dispatch = useAppDispatch();

    const {user} = useAuth();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            number: "",
        },
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)

        setUploading(true)

        try {
            const {data} = await toast.promise(api.post("/teams", {
                user_id: user?.id,
                name: values.name,
                number: values.number,
            }), {
                loading: "Creating team...",
                success: () => {
                    form.reset({
                        name: "",
                        number: "",
                    })
                    setUploading(false)
                    setShowDialog(false)
                    return "Team created"
                },
                error: (err) => {
                    setUploading(false)
                    return `Failed to create team: ${err.message}`
                },
            })
            dispatch(addTeamForUser(data))
        } catch (error) {
            setUploading(false)
            toast.error("Failed to upload entry")
        }

    }

    return (
        <DialogContent className="sm:max-w-xl">
            <DialogHeader>
                <DialogTitle>New Team</DialogTitle>
                <DialogDescription>
                </DialogDescription>
            </DialogHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <FormField
                        control={form.control}
                        name="number"
                        disabled={uploading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex. 6842Z" {...field} />
                                </FormControl>
                                {/*<FormDescription>*/}
                                {/*    The name of your notebook should be descriptive and concise.*/}
                                {/*</FormDescription>*/}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="name"
                        disabled={uploading}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Ex. PigPen" {...field} />
                                </FormControl>
                                {/*<FormDescription>*/}
                                {/*    The name of your notebook should be descriptive and concise.*/}
                                {/*</FormDescription>*/}
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Separator />
                    <Button disabled={uploading || !user} type="submit">Create</Button>
                </form>
            </Form>
        </DialogContent>
    )
}
