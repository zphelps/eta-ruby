"use client"
import {Button} from "@/components/ui/button";
import {api} from "@/lib/api";
import {useAuth} from "@/hooks/useAuth";
import {useEffect, useState} from "react";
import {Task} from "@/types/task";
import {Card, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {useSearchParams} from "next/navigation";
import {EntriesSideBar} from "@/components/editor/entries-side-bar";
import DashboardHeader from "@/components/editor/header";
import {EntryToolbar} from "@/components/editor/entry-toolbar";

export default function Dashboard() {

    const {user} = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);

    const searchParams = useSearchParams();

    const selectedEntryId = searchParams.get("entry");
    const selectedNotebookId = searchParams.get("notebook");

    async function addTask() {
        await api.post("/tasks", {
            uid: user?.id,
            name: "New Task",
            description: "This is a new tasks",
            completed: false,
            dueDate: new Date(),
        });
    }

    async function fetchTasks() {
        const response = await api.get("/tasks", {
            params: {
                uid: user?.id
            }
        });
        console.log(response.data);
        setTasks(response.data);
    }

    useEffect(() => {
        // fetchTasks();
    }, []);

    return (
        <div className={'h-screen pt-[64px] flex'}>
            <div className={'min-w-[325px] max-w-[325px]'}>
                <EntriesSideBar />
            </div>

            {selectedEntryId && <div className={"w-full"}>
                <EntryToolbar id={selectedEntryId}/>
            </div>}
        </div>
    )
}
