import {FC, useState} from "react";
import {Entry} from "@/types/entry";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {api} from "@/lib/api";
import toast from "react-hot-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {useAppDispatch} from "@/store";
import {updateEntry} from "@/app/api/notebooks/helpers";
import {setEntry} from "@/slices/entries";

interface EditEntryNameDialogProps {
    entry: Entry;
    children: React.ReactNode;
}

const formSchema = z.object({
    title: z.string().min(3, "Entry name must be at least 3 characters.").max(100, "Entry name cannot be more than 100 characters."),
})

export const EditEntryNameDialog: FC<EditEntryNameDialogProps> = ({entry, children}) => {
    const [open, setOpen] = useState(false);
    const dispatch = useAppDispatch();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        values: {
            title: entry.title,
        },
    })


    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        await toast.promise(api.put(`/entries`, {
            id: entry.id,
            title: values.title,
        }), {
            loading: "Updating entry name...",
            success: "Entry name updated",
            error: "Failed to update entry name",
        })
        dispatch(setEntry({
            ...entry,
            title: values.title,
        }));
        form.reset()
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={o => setOpen(o)}>
            <DialogTrigger>
                {children}
            </DialogTrigger>
            <DialogContent aria-describedby={"rename-entry"}>
                <DialogHeader>
                    <DialogTitle>Rename Entry</DialogTitle>
                    <DialogDescription>
                        {/*This action cannot be undone. This will permanently delete your account*/}
                        {/*and remove your data from our servers.*/}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    {/*<FormLabel>Entry Name</FormLabel>*/}
                                    <FormControl>
                                        <Input placeholder="Ex. Goals for the Season..." {...field} />
                                    </FormControl>
                                    {/*<FormDescription>*/}
                                    {/*    This is your public display name.*/}
                                    {/*</FormDescription>*/}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Save</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
