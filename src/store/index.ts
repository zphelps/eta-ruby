import { configureStore } from '@reduxjs/toolkit'
import {TypedUseSelectorHook, useDispatch, useSelector, useStore} from "react-redux";
import entriesReducer from "@/slices/entries";
import teamsReducer from "@/slices/teams";
import notebooksReducer from "@/slices/notebooks";

export const makeStore = () => {
    return configureStore({
        reducer: {
            entries: entriesReducer,
            teams: teamsReducer,
            notebooks: notebooksReducer,
        },
    })
}

// Infer the type of makeStore
export type AppStore = ReturnType<typeof makeStore>
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']


// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
export const useAppStore: () => AppStore = useStore
