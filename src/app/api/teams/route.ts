import {createClient} from "@/utils/supabase/server";
import {z} from "zod";
import {NextRequest, NextResponse} from "next/server";
import {User} from "@/types/user";
import { v4 as uuidv4 } from 'uuid';

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
            .from("user_team")
            .select("team:team_id(*)")
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
        user_id: z.string(),
        number: z.string(),
        name: z.string(),
    });

    const validationResponse = schema.safeParse(body);
    if (!validationResponse.success) {
        return NextResponse.json({
            message: "Invalid request schema",
            error: validationResponse.error.errors
        }, { status: 400 })
    }

    const supabase = createClient();

    const team_id = uuidv4();

    const {error} = await supabase
        .from("teams")
        .insert({
            id: team_id,
            number: body.number,
            name: body.name,
        })

    if (error) {
        return NextResponse.json({
            message: error.message,
            error: error.message
        }, { status: 400 })
    }

    const {error:user_team_error} = await supabase
        .from("user_team")
        .insert({
            user_id: body.user_id,
            team_id: team_id,
        })

    if (user_team_error) {
        return NextResponse.json({
            message: user_team_error.message,
            error: user_team_error.message
        }, { status: 400 })
    }

    return NextResponse.json({
        message: 'Success',
        data: {
            user_id: body.user_id,
            team: {
                id: team_id,
                number: body.number,
                name: body.name,
            }
        }
    }, { status: 200 })
}

export async function PUT(request: Request) {}

export async function DELETE(request: Request) {}

export async function PATCH(request: Request) {}
