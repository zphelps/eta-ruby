import type {Metadata} from "next";
import {config} from "@/config";

export const getMetadata = ({
                               title,
                               description,
                               keywords,
                               openGraph,
                               canonicalUrlRelative,
                               extraTags,
                           }: Metadata & {
    canonicalUrlRelative?: string;
    extraTags?: Record<string, any>;
} = {}) => {
    return {
        // up to 50 characters (what does your app do for the user?) > your main should be here
        title: title || config.app.name,
        // up to 160 characters (how does your app help the user?)
        description: description || config.app.description,
        // some keywords separated by commas. by default it will be your app name
        keywords: keywords || [config.app.name],
        applicationName: config.app.name,
        // set a base URL prefix for other fields that require a fully qualified URL (.e.g og:image: og:image: 'https://yourdomain.com/share.png' => '/share.png')
        metadataBase: new URL(
            process.env.NODE_ENV === "development"
                ? "http://localhost:3000/"
                : `https://${config.domain}/`
        ),

        openGraph: {
            title: openGraph?.title || config.app.name,
            description: openGraph?.description || config.app.description,
            url: openGraph?.url || `https://${config.domain}/`,
            siteName: openGraph?.title || config.app.name,
            // If you add an opengraph-image.(jpg|jpeg|png|gif) image to the /app folder, you don't need the code below
            // images: [
            //   {
            //     url: `https://${config.domainName}/share.png`,
            //     width: 1200,
            //     height: 660,
            //   },
            // ],
            locale: "en_US",
            type: "website",
        },

        twitter: {
            title: openGraph?.title || config.app.name,
            description: openGraph?.description || config.app.description,
            // If you add an twitter-image.(jpg|jpeg|png|gif) image to the /app folder, you don't need the code below
            // images: [openGraph?.image || defaults.og.image],
            card: "summary_large_image",
            creator: "@zachphelps8216",
        },

        // If a canonical URL is given, we add it. The metadataBase will turn the relative URL into a fully qualified URL
        ...(canonicalUrlRelative && {
            alternates: {canonical: canonicalUrlRelative},
        }),

        // If you want to add extra tags, you can pass them here
        ...extraTags,
    } as Metadata;
};