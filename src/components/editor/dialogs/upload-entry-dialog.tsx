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
import {CalendarIcon} from "lucide-react";
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

const formSchema = z.object({
    title: z.string().min(3, "Entry title must be at least 3 characters.").max(100, "Entry title cannot be more than 100 characters."),
    date: z.date(),
    file: z.instanceof(File),
})

interface UploadEntryDialogProps {
    minimumDate?: Date,
    children: React.ReactNode
}

export const UploadEntryDialog: FC<UploadEntryDialogProps> = (props) => {
    const {children, minimumDate} = props
    const [uploading, setUploading] = useState(false)
    const [open, setOpen] = useState(false)
    const dispatch = useAppDispatch();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            date: minimumDate,
            file: undefined,
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

            // if values.date is the same as minimumDate, add one minute to it
            if (minimumDate && values.date.getTime() === minimumDate.getTime()) {
                values.date.setMilliseconds(values.date.getMilliseconds() + 1)
            }

            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', values.file);
            formData.append('title', values.title);
            formData.append('date', values.date.toUTCString());
            formData.append('notebook_id', notebookId)


            // const {data} = await toast.promise(api.post("/document_ocr", formData), {
            //     loading: "Parsing document...",
            //     success: () => {
            //         form.reset({
            //             title: "",
            //             date: minimumDate,
            //             file: undefined,
            //         })
            //         return "Document parsed!"
            //     },
            //     error: (err) => {
            //         setUploading(false)
            //         return err.message
            //     },
            // })
            //
            // console.log(data)


            const {data: entry} = await toast.promise(api.post("/entries", formData), {
                loading: "Uploading entry...",
                success: () => {
                    form.reset({
                        title: "",
                        date: minimumDate,
                        file: undefined,
                    })
                    setUploading(false)
                    setOpen(false)
                    return "Entry uploaded"
                },
                error: (err) => {
                    setUploading(false)
                    return `Failed to upload entry: ${err.message}`
                },
            })

            dispatch(setEntry(entry))
            const params = new URLSearchParams(searchParams.toString())
            params.set('entry', id)
            window.history.pushState(null, '', `?${params.toString()}`)
        } catch (error) {
            setUploading(false)
        }

    }

    return (
        <Dialog open={open} onOpenChange={o => setOpen(o)}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>Upload entry</DialogTitle>
                    <DialogDescription>
                        Drag and drop your files here or click to browse.
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
                                        <Input placeholder="Ex. Brainstorming Solutions to Challenge" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        The title of your entry should be descriptive and concise.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="date"
                            disabled={uploading}
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel>Date of Creation</FormLabel>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <FormControl>
                                                <Button
                                                    disabled={uploading}
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </FormControl>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value ? new Date(field.value) : undefined}
                                                onSelect={field.onChange}
                                                disabled={(date) =>
                                                    {
                                                        if (minimumDate) {
                                                            return date < minimumDate
                                                        }
                                                        else {
                                                            return false;
                                                        }
                                                    }
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                    <FormDescription>
                                        The date of your entry should be the date you created it.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="file"
                            disabled={uploading}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>File</FormLabel>
                                    <EntryUploader
                                        disabled={uploading}
                                        maxFileCount={1}
                                        maxSize={19.5 * 1024 * 1024}
                                        value={field.value ? [field.value] : []}
                                        onValueChange={files => {
                                            console.log(files)
                                            field.onChange(files[0])
                                        }}
                                        accept={{
                                            "application/pdf": [],
                                        }}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Separator />
                        <Button disabled={uploading} type="submit">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}