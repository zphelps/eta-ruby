import {createClient} from "@/utils/supabase/server";

export const getTeamIDsForUser = async (user_id: string) => {
    const supabase = createClient();
    const {data, error} = await supabase
        .from("user_team")
        .select("user_id, team_id")
        .eq("user_id", user_id);

    if (error) {
        throw new Error(error.message);
    }

    return data?.map((team: any) => team.team_id);
}
