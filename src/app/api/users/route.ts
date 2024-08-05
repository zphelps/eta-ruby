import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {User} from "@/types/user";

export async function GET(request: NextRequest): Promise<NextResponse> {
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
            .from("users")
            .select("*")
            .eq("id", query.uid)
            .single();

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
        id: z.string(),
        email: z.string().email("Must provide valid email"),
        teamId: z.string().optional(),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: 'Invalid user schema',
            error: validationResponse.error
        }, { status: 400 })
    }

    try {
        const supabase = createClient();
        const {error} = await supabase.from("users").insert(validationResponse.data);

        if (error) {
            console.log(error)
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            message: 'Success',
        }, { status: 200 })
    } catch (e) {
        console.log(e)
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
