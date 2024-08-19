"use client"

import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";
import {useState} from "react";
import {useToast} from "@/components/ui/use-toast";
import { z } from "zod"
import {zodResolver} from "@hookform/resolvers/zod";
import {useForm} from "react-hook-form";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { ReloadIcon } from "@radix-ui/react-icons"
import {useRouter} from "next/navigation";
import {useSearchParams} from "next/navigation";
import {config} from "@/config";

const loginFormSchema = z.object({
    email: z.string().email("Must provide valid email"),
    password: z.string().min(8, "Password must be at least 8 characters.")
})

export default function SignIn() {

    const {signInWithGoogle, signInWithEmailAndPassword} = useAuth();
    const { toast } = useToast()
    const [loading, setLoading] = useState(false);
    const searchParams = useSearchParams();
    const router = useRouter();

    const form = useForm<z.infer<typeof loginFormSchema>>({
        resolver: zodResolver(loginFormSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })


    async function onSubmit(values: z.infer<typeof loginFormSchema>) {
        try {
            setLoading(true);
            const data = {
                email: values.email,
                password: values.password,
            }

            await signInWithEmailAndPassword(data);

            const returnTo = searchParams.get('returnTo');

            router.replace(returnTo || config.auth.defaultAuthenticatedUrl)

            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Make sure your email and password are correct and try again.",
            })
        }
    }

    return (
        <section className="bg-gradient-to-b from-gray-100 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="pt-32 pb-12 md:pt-40 md:pb-20 mb-28">

                    {/* Page header */}
                    <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                        <h1 className="text-3xl font-bold">Welcome back.</h1>
                    </div>

                    {/* Form */}
                    <div className="max-w-sm mx-auto">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="Email"
                                                    {...field}
                                                    className={"py-5 rounded form-input w-full text-gray-800"}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="password"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Password</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type={'password'}
                                                    className={"py-5 rounded form-input w-full text-gray-800"}
                                                    placeholder="Password"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit"
                                        className={"p-6 rounded-lg btn font-semibold text-white bg-blue-600 hover:bg-blue-700 w-full"}
                                        disabled={loading}
                                >
                                    {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>}
                                    Sign In
                                </Button>
                            </form>
                        </Form>
                        <div className="flex items-center my-6">
                          <div className="border-t border-gray-300 grow mr-3" aria-hidden="true"></div>
                          <div className="text-gray-600 italic text-sm">Or</div>
                          <div className="border-t border-gray-300 grow ml-3" aria-hidden="true"></div>
                        </div>
                        <div className="flex flex-wrap -mx-3">
                            <div className="w-full px-3">
                                <button
                                    onClick={async () => {
                                        await signInWithGoogle();
                                    }}
                                    className="btn rounded-lg py-2.5 px-5 text-white border border-slate-200 bg-slate-50 hover:bg-slate-100 w-full relative flex items-center">
                                    <div style={{width: "26px"}}>
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"
                                             style={{display: "block"}}>
                                            <path fill="#EA4335"
                                                  d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                            <path fill="#4285F4"
                                                  d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                            <path fill="#FBBC05"
                                                  d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                            <path fill="#34A853"
                                                  d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                            <path fill="none" d="M0 0h48v48H0z"></path>
                                        </svg>
                                    </div>
                                    <span className="flex-auto pl-16 pr-8 -ml-16 text-black font-semibold">Continue with Google</span>
                                </button>
                            </div>
                        </div>
                        <div className="text-gray-600 text-center mt-6">
                            {"Don't you have an account?"} <Link href={`${config.auth.signupUrl}?${searchParams}`} className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign up</Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
