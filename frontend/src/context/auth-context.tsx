"use client";
import type {FC, ReactNode} from "react";
import {createContext, useCallback, useEffect, useReducer} from "react";
import PropTypes from "prop-types";
import {AuthChangeEvent, Session} from "@supabase/supabase-js";
import {createClient} from "@/utils/supabase/client";
import {useSearchParams} from "next/navigation";
import {config} from "@/config";
import {User} from "@/types/user";
import {api} from "@/lib/api";
import toast from "react-hot-toast";

interface State {
    isInitialized: boolean;
    isAuthenticated: boolean;
    user: User | null;
}

enum ActionType {
    AUTH_STATE_CHANGED = "AUTH_STATE_CHANGED"
}

type AuthStateChangedAction = {
    type: ActionType.AUTH_STATE_CHANGED;
    payload: {
        isAuthenticated: boolean;
        user: User | null;
    };
};

type Action = AuthStateChangedAction;

const initialState: State = {
    isAuthenticated: false,
    isInitialized: false,
    user: null
};

const reducer = (state: State, action: Action): State => {
    if (action.type === "AUTH_STATE_CHANGED") {
        const {isAuthenticated, user} = action.payload;

        return {
            ...state,
            isAuthenticated,
            isInitialized: true,
            user
        };
    }

    return state;
};

export interface AuthContextType extends State {
    signUp: (data: {email: string, password: string}) => Promise<any>;
    signInWithEmailAndPassword: (data: {email: string, password: string}) => Promise<any>;
    signInWithGoogle: () => Promise<any>;
    signOut: () => Promise<any>;
}

export const AuthContext = createContext<AuthContextType>({
    ...initialState,
    signUp: () => Promise.resolve(),
    signInWithEmailAndPassword: () => Promise.resolve(),
    signInWithGoogle: () => Promise.resolve(),
    signOut: () => Promise.resolve()
} as AuthContextType);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: FC<AuthProviderProps> = (props) => {
    const {children} = props;
    const [state, dispatch] = useReducer(reducer, initialState);

    const supabase = createClient();
    const auth = supabase.auth;
    const searchParams = useSearchParams();

    const signUp = async (data: {email: string, password: string}) => {
        const {data: response, error} = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
        })

        if (error) {
            throw error;
        }

        return response.user;
    }

    const signInWithEmailAndPassword = async (data: {email: string, password: string}) => {
        const {error} = await supabase.auth.signInWithPassword(data)

        if (error) {
            throw error;
        }

        return null;
    }

    const signInWithGoogle = async () => {
        const returnTo = searchParams.get("returnTo") || config.auth.defaultAuthenticatedUrl;
        const {error} = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin + `/auth/callback?next=${returnTo}`,
                scopes: "email profile",
            }
        })

        if (error) {
            throw error;
        }

        return null;
    }

    const signOut = async () => {
        await supabase.auth.signOut()
    }

    const handleAuthStateChanged = useCallback(
        async (_: AuthChangeEvent, session: Session | null) => {
            if (session?.user) {
                // console.log("SIGNED_IN", session);

                const {data: user} = await api.get(`/users`, {
                    params: {
                        uid: session.user.id
                    }
                });

                // console.log("USER", user);

                dispatch({
                    type: ActionType.AUTH_STATE_CHANGED,
                    payload: {
                        isAuthenticated: true,
                        user: user,
                    }
                });
            } else {
                dispatch({
                    type: ActionType.AUTH_STATE_CHANGED,
                    payload: {
                        isAuthenticated: false,
                        user: null
                    }
                });
            }
        },
        [dispatch]
    );

    useEffect(
        () => {
            auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
                return handleAuthStateChanged(event, session);
            });
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        []
    );


    return (
        <AuthContext.Provider
            value={{
                ...state,
                signUp,
                signInWithEmailAndPassword,
                signInWithGoogle,
                signOut,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;
