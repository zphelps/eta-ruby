import {useCallback, useEffect} from "react";
import {RootState, useAppDispatch, useAppSelector} from "@/store";
import {api} from "@/lib/api";
import {setTeamsForUser} from "@/slices/teams";

export const useUserTeams = (user_id: string) => {
    const dispatch = useAppDispatch();
    const teams = useAppSelector((state: RootState) => state.teams.teams);

    const fetchTeams = useCallback(async (user_id: string) => {
        try {
            const response = await api.get("/teams", {
                params: {
                    uid: user_id,
                }
            });

            const teams = response.data.map((team: any) => {
                return {
                    id: team.team.id,
                    name: team.team.name,
                    number: team.team.number,
                }
            });
            dispatch(setTeamsForUser({
                user_id: user_id,
                teams: teams,
            }));
        } catch (err) {
            console.error(err);
        }
    }, [user_id]);

    useEffect(() => {
            fetchTeams(user_id);
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [user_id]
    );

    return Object.values(teams[user_id] || []);
}
