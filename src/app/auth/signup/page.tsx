"use client"

import Link from "next/link";
import {useAuth} from "@/hooks/useAuth";
import {useEffect, useState} from "react";
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
import {api} from "@/lib/api";

export default function SignUp() {
    const loginFormSchema = z.object({
        email: z.string().email("Must provide valid email"),
        password: z.string().min(8, "Password must be at least 8 characters.")
    })

    const {signUp} = useAuth();
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

            const supabaseUser = await signUp(data);

            await api.post("/users", {
                id: supabaseUser.id,
                email: supabaseUser.email,
            })

            const returnTo = searchParams.get('returnTo');

            router.replace(returnTo || config.auth.defaultAuthenticatedUrl)

            setLoading(false)
        } catch (error) {
            setLoading(false)
            console.log(error)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "Please try again.",
            })
        }
    }

    return (
        <section className="bg-gradient-to-b from-gray-100 to-white">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
                <div className="pt-32 pb-12 md:pt-40 md:pb-20 mb-28">

                    {/* Page header */}
                    <div className="max-w-3xl mx-auto text-center pb-12 md:pb-20">
                        <h1 className="text-3xl font-bold">Welcome!</h1>
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
                                        className={"p-6 rounded-lg btn text-white bg-blue-600 hover:bg-blue-700 w-full"}
                                        disabled={loading}
                                >
                                    {loading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin"/>}
                                    Sign Up
                                </Button>
                            </form>
                        </Form>
                        <div className="flex items-center my-6">
                          <div className="border-t border-gray-300 grow mr-3" aria-hidden="true"></div>
                          <div className="text-gray-600 italic text-sm">Or</div>
                          <div className="border-t border-gray-300 grow ml-3" aria-hidden="true"></div>
                        </div>
                        <div className="text-gray-600 text-center mt-6">
                          Already have an account? <Link href="/signup" className="text-blue-600 hover:underline transition duration-150 ease-in-out">Sign in</Link>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}
