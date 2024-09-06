import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {User} from "@/types/user";
import {getTeamIDsForUser} from "@/app/api/teams/helpers";
import {createStorageBucket} from "@/app/api/notebooks/helpers";

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
            .from("user_notebooks")
            .select("*, notebooks:notebook_id(*)")
            .eq("user_id", query.uid);

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
        title: z.string(),
        team_id: z.string(),
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
        const {error} = await supabase.from("notebooks").insert(body);

        await createStorageBucket(body.id);

        if (error) {
            console.log(error)
            return NextResponse.json({
                message: error.message,
                error: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            message: 'Success',
            data: {
                id: body.id,
                title: body.title,
                team_id: body.team_id
            }
        }, { status: 200 })
    } catch (e) {
        console.log("Error in POST /notebooks", e)
        return NextResponse.json({
            message: 'Invalid Request',
            error: e
        }, { status: 400 })
    }
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
