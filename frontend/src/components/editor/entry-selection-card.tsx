import {cn} from "@/lib/utils";
import {Calendar as CalendarIcon, Layers, Trash} from "lucide-react";
import {format} from "date-fns";
import {Button} from "@/components/ui/button";
import * as React from "react";
import {FC} from "react";
import { EntrySelection } from "./dialogs/upload-multiple-entries-dialog";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {FormControl} from "@/components/ui/form";
import {Calendar} from "@/components/ui/calendar";
import {SelectSingleEventHandler} from "react-day-picker";



interface EntrySelectionCardProps {
    uploading: boolean;
    selection: EntrySelection;
    minimumDate?: Date;
    handleEntrySelectionClicked: (id: string) => void;
    entrySelectionIdBeingEdited?: string;
    setEntrySelections: (prev: React.SetStateAction<EntrySelection[]>) => void;
}

export const EntrySelectionCard:FC<EntrySelectionCardProps> = (props) => {
    const {uploading, selection, minimumDate, handleEntrySelectionClicked, entrySelectionIdBeingEdited, setEntrySelections} = props;

    const onEntrySelectionTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEntrySelections((prev: EntrySelection[]) => {
            return prev.map((entrySelection) => {
                if (entrySelection.id === selection.id) {
                    return {
                        ...entrySelection,
                        entry: {
                            ...entrySelection.entry,
                            title: e.target.value
                        }
                    }
                }
                return entrySelection;
            })
        })
    }

    const onEntrySelectionDateChange = (date: Date | undefined) => {
        setEntrySelections((prev: EntrySelection[]) => {
            return prev.map((entrySelection) => {
                if (entrySelection.id === selection.id) {
                    return {
                        ...entrySelection,
                        entry: {
                            ...entrySelection.entry,
                            created_at: date?.toISOString()
                        }
                    }
                }
                return entrySelection;
            })
        })
    }

    return (
        <div
            onClick={() => handleEntrySelectionClicked(selection.id)}
            key={selection.id}
            className={cn(entrySelectionIdBeingEdited === selection.id ? "border-sky-300 border-2 bg-sky-50" : "border border-slate-200 hover:bg-slate-50", 'flex items-center justify-between rounded-lg p-2 cursor-pointer')}
        >
            <div className={'space-y-1.5 w-full'}>
                {entrySelectionIdBeingEdited === selection.id && !uploading && <input
                    disabled={entrySelectionIdBeingEdited !== selection.id}
                    placeholder={"Entry title..."}
                    type="text"
                    value={selection.entry.title}
                    className={"hover:bg-slate-200 w-full px-1.5 rounded-md cursor-pointer border-none bg-transparent font-medium"}
                    onChange={onEntrySelectionTitleChange}
                />}
                {(entrySelectionIdBeingEdited !== selection.id || uploading) && <p className={"pl-1.5 font-medium text-slate-500"}>{selection.entry.title}</p>}
                <div className={'flex items-center space-x-2 px-1 w-full'}>
                    <p className={cn((!selection.start_page || !selection.end_page)
                        ? "border-red-500 bg-red-50 text-red-500"
                        : entrySelectionIdBeingEdited === selection.id
                                ? "border-sky-400 bg-sky-50 text-sky-500"
                                : "border-slate-200 bg-slate-50 text-slate-500",
                        "rounded-md text-sm font-normal border px-1.5 py-0.5 flex items-center")}>
                        <Layers size={16} className={cn((!selection.start_page || !selection.end_page) && "text-red-500", "mr-1.5")}/>
                        {selection.start_page || "?"}-{selection.end_page || "?"}
                    </p>
                    {entrySelectionIdBeingEdited !== selection.id && (
                        <p className={"border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 rounded-md h-fit font-normal text-sm border py-0.5 px-2 flex items-center"}>
                            <CalendarIcon size={16} className={"mr-1.5 mb-0.5"}/>
                            {format(new Date(selection?.entry?.created_at!), "MMM dd, yyyy")}
                        </p>
                    )}
                    {entrySelectionIdBeingEdited === selection.id && (
                        <Popover>
                            <PopoverTrigger disabled={entrySelectionIdBeingEdited !== selection.id || uploading}>
                                <p className={"border-sky-400 bg-sky-50 text-sky-500 hover:bg-slate-100 rounded-md h-fit font-normal text-sm border py-0.5 px-2 flex items-center"}>
                                    <CalendarIcon size={16} className={"mr-1.5 mb-0.5"}/>
                                    {format(new Date(selection?.entry?.created_at!), "MMM dd, yyyy")}
                                </p>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    required
                                    selected={selection?.entry?.created_at ? new Date(selection.entry.created_at) : undefined}
                                    onSelect={onEntrySelectionDateChange}
                                    disabled={(date) => {
                                        if (minimumDate) {
                                            return date < minimumDate;
                                        } else {
                                            return false;
                                        }
                                    }
                                    }
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    )}
                </div>
            </div>
            {/*<Button variant={"ghost"} size={"icon"}>*/}
            {/*    <Trash size={16}/>*/}
            {/*</Button>*/}
        </div>
    )
}
