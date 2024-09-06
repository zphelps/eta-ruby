import {cn} from "@/lib/utils";
import {CheckIcon, X} from "lucide-react";
import {Button} from "@/components/ui/button";

const pricing = {
    tiers: [
        {
            name: "Full Season Access",
            id: "starter",
            href: "#",
            original_price: "$100",
            discount_price: "$75",
            currency: "USD",
            description: "",
            features: [
                {
                    "name": "Customizable competition view for judging",
                    "included": true,
                },
                {
                    "name": "Automatic table of contents",
                    "included": true,
                },
                {
                    "name": "Unlimited PDF downloads",
                    "included": true,
                },
                {
                    "name": "Permanent notebook link for competitions",
                    "included": true,
                },
                {
                    "name": "Guaranteed customer support for the entire season",
                    "included": true,
                },
                {
                    "name": "Discord community access",
                    "included": true,
                },
                {
                    "name": "Season-long updates",
                    "included": true,
                },
                // {
                //     "name": "Discord community",
                //     "included": false,
                // },
                // {
                //     "name": "Lifetime updates",
                //     "included": false,
                // }
            ],
            mostPopular: true,
        },
        // {
        //     name: "Pro",
        //     id: "pro",
        //     href: "#",
        //     original_price: "$299",
        //     discount_price: "$199",
        //     currency: "USD",
        //     description: "",
        //     features: [
        //         {
        //             "name": "Next.js, Shadcn, & Tailwind CSS Boilerplate",
        //             "included": true,
        //         },
        //         {
        //             "name": "SEO",
        //             "included": true,
        //         },
        //         {
        //             "name": "Google Oauth & Password Authentication",
        //             "included": true,
        //         },
        //         {
        //             "name": "Supabase, Firebase, and MongoDB",
        //             "included": true,
        //         },
        //         {
        //             "name": "Stripe payments",
        //             "included": true,
        //         },
        //         {
        //             "name": "Mailgun emails",
        //             "included": true,
        //         },
        //         {
        //             "name": "Dozens of pre-built UI components",
        //             "included": true,
        //         },
        //         {
        //             "name": "Discord community",
        //             "included": true,
        //         },
        //         {
        //             "name": "Lifetime updates",
        //             "included": true,
        //         }
        //     ],
        //     mostPopular: true,
        // },
    ],
};

export default function Pricing() {

    return (
        <div id={"pricing_section"} className="mx-auto mb-8 py-12 max-w-7xl px-6 sm:mt-32 lg:px-8">
            <div className="mx-auto max-w-4xl text-center">
                <h1 className="text-base font-semibold leading-7 text-blue-600">Pricing</h1>
                <p className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                    Give your team the competitive edge in judging
                </p>
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-gray-500">
                EngScribe's pricing model lets you start building your world-class notebook within seconds.
            </p>
            <div
                className="mx-auto mt-16 grid max-w-xl gap-8">
                {pricing.tiers.map((tier) => (
                    <div
                        key={tier.id}
                        className={cn(
                            tier.mostPopular ? "ring-2 ring-blue-600" : "border border-gray-500",
                            "rounded-3xl p-8 relative",
                        )}
                    >
                        <h2
                            id={tier.id}
                            className={cn(
                                tier.mostPopular ? "text-blue-600" : "text-gray-100",
                                "text-2xl font-semibold leading-8",
                            )}
                        >
                            {tier.name}
                        </h2>
                        {/*<p className="mt-4 leading-6 text-gray-400">{tier.description}</p>*/}
                        <p className="mt-6 flex items-center gap-x-1 space-x-1.5">
                            <span
                                className="text-xl font-medium tracking-tight text-gray-400 line-through">{tier.original_price}</span>
                            <span
                                className="text-5xl font-bold tracking-tight text-gray-600">{tier.discount_price}</span>
                            <span
                                className="font-bold tracking-tight text-gray-400">{tier.currency}</span>
                        </p>
                        <ul role="list" className="mt-8 space-y-3 leading-6 text-gray-600">
                            {tier.features.map((feature) => (
                                <li key={feature.name}
                                    className={cn(feature.included ? "text-gray-600" : "text-gray-600", "flex gap-x-3")}>
                                    {feature.included &&
                                        <CheckIcon aria-hidden="true" className="h-6 w-5 flex-none text-blue-600"/>}
                                    {!feature.included &&
                                        <X aria-hidden="true" className="h-6 w-5 flex-none text-grey-900"/>}
                                    {feature.name}
                                </li>
                            ))}
                        </ul>
                        <Button
                            className={'py-6 rounded-xl w-full mt-8'}
                        >
                            Buy Now
                        </Button>
                    </div>
                ))}
            </div>
            <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-gray-500">
                EngScribe will also accept a purchase order as a method of payment. EngScribe happily works with large organizations (6+ teams) to provide bulk discounts. Contact us to learn more.
            </p>
        </div>

    )
}
