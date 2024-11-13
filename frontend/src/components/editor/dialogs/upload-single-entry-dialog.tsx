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
import { FileUploader } from "@/components/editor/file-uploader"
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { FC, useState } from "react";
import toast from "react-hot-toast";
import { v4 as uuid } from "uuid";
import { setEntry } from "@/slices/entries";
import { useAppDispatch } from "@/store";

const formSchema = z.object({
    title: z.string().min(3, "Entry title must be at least 3 characters.").max(100, "Entry title cannot be more than 100 characters."),
    date: z.date(),
    file: z.instanceof(File),
})

interface UploadEntryDialogProps {
    notebook_id?: string,
    minimum_date?: Date,
    setDialogMenu?: (menu: string) => void;
}

export const UploadSingleEntryDialog: FC<UploadEntryDialogProps> = (props) => {
    const { minimum_date, notebook_id, setDialogMenu } = props
    const [uploading, setUploading] = useState(false)
    const dispatch = useAppDispatch();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: "",
            date: minimum_date,
            file: undefined,
        },
    })

    const searchParams = useSearchParams();
    const { push } = useRouter();
    const pathname = usePathname();

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log('Form values:', values);

        // Ensure notebook_id is available
        if (!notebook_id) {
            toast.error("Notebook not found");
            return;
        }

        toast.loading("Uploading entry...");
        setUploading(true);

        try {
            const id = uuid();

            // Avoid mutating values.date directly
            let entryDate = new Date(values.date);
            // If the date is the same as the minimum date, add one millisecond to it
            if (minimum_date && entryDate.getTime() === minimum_date.getTime()) {
                entryDate.setMilliseconds(entryDate.getMilliseconds() + 1);
            }

            const formData = new FormData();
            formData.append('id', id);
            formData.append('file', values.file, values.file.name || 'uploaded-file.pdf');
            formData.append('title', values.title);
            formData.append('date', entryDate.toUTCString());
            formData.append('notebook_id', notebook_id);

            const response = await fetch("https://us-west1-eta-ruby.cloudfunctions.net/upload-single-entry", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload failed with status:', response.status, response.statusText);
                console.error('Response:', errorText);
                throw new Error(`Failed to upload entry: ${response.status} ${response.statusText}`);
            }

            let entry;
            try {
                entry = await response.json();
            } catch (jsonError) {
                console.error('Failed to parse response JSON:', jsonError);
                throw new Error('Failed to parse server response');
            }

            console.log("Frontend recieved entry:", entry);

            dispatch(setEntry(entry));

            form.reset({
                title: "",
                date: minimum_date,
                file: undefined,
            });

            const params = new URLSearchParams(searchParams.toString());
            params.set('entry', id);
            push(`${pathname}?${params.toString()}`);

        } catch (error) {
            if (error.name === 'TypeError') {
                console.error('Network error:', error);
                toast.error('Network error occurred. Please check your connection and try again.');
            } else {
                console.error('Error during upload:', error);
                toast.error(`Failed to upload entry: ${error instanceof Error && error.message ? error.message : 'Unknown error'}`);
            }
        } finally {
            setDialogMenu("none");
            toast.dismiss();
            toast.success("Entry uploaded successfully");
            setUploading(false);
        }
    }

    return (
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
                                            disabled={(date) => {
                                                if (minimum_date) {
                                                    return date < minimum_date
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
                                <FileUploader
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
    )
}
