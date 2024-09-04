import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    const query = Object.fromEntries(request.nextUrl.searchParams.entries())

    const schema = z.object({
        uid: z.string(),
    });

    const validationResponse = schema.safeParse(query);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: "Invalid request schema",
            error: validationResponse.error.errors
        }, { status: 400 })
    }

    try {
        const supabase = createClient();
        const {data, error} = await supabase
            .from("tasks")
            .select("*")
            .eq("uid", query.uid);

        if (error) {
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            data: data,
            message: 'Success',
        }, { status: 200 })
    } catch (e) {
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function HEAD(request: Request) {}

export async function POST(request: Request) {
    const body = await request.json();

    const schema = z.object({
        id: z.string().optional(),
        name: z.string(),
        description: z.string(),
        completed: z.boolean().optional(),
        uid: z.string(),
        dueDate: z.string().optional(),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: 'Invalid request schema',
            error: validationResponse.error
        }, { status: 400 })
    }

    try {
        const supabase = createClient();
        const {error} = await supabase.from("tasks").insert(validationResponse.data);

        if (error) {
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            message: 'Success',
        }, { status: 200 })
    } catch (e) {
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}