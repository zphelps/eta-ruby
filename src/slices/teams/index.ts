import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {Entry} from "@/types/entry";
import {Team} from "@/types/team";

type SliceState = {
    teams: { [user_id: string]: Team[]; };
}

const initialState: SliceState = {
    teams: {},
}

const teamsSlice = createSlice({
    name: 'teams',
    initialState,
    reducers: {
        addTeamForUser: (state, action: PayloadAction<{user_id: string, team: Team}>) => {
            if (state.teams[action.payload.user_id]) {
                state.teams[action.payload.user_id].push(action.payload.notebook)
            } else {
                state.teams[action.payload.user_id] = [action.payload.notebook]
            }
        },
        setTeamsForUser: (state, action: PayloadAction<{ user_id: string, teams: Team[] }>) => {
            state.teams[action.payload.user_id] = action.payload.teams
        },
        removeTeamForUser: (state, action: PayloadAction<{user_id: string, team_id: string}>) => {
            state.teams[action.payload.user_id] = state.teams[action.payload.user_id].filter(team => team.id !== action.payload.team_id)
        },
    }
})

export const {
    addTeamForUser,
    setTeamsForUser,
    removeTeamForUser,
} = teamsSlice.actions

export default teamsSlice.reducer;
