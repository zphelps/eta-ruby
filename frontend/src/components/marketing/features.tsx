import { CheckIcon } from '@heroicons/react/20/solid'
import {useState} from 'react';
import {Eye, NotebookText, Send, AlignJustify, Tag, Puzzle} from "lucide-react";


const features = [
    {
        name: 'Handwritten and digital notebook support',
        icon: <NotebookText/>,
        description: 'EngScribe organizes both handwritten and digital notebooks, keeping your notebook in order and viewable by all members of your team.',
        image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        name: 'Customizable notebook view for judging',
        icon: <Puzzle />,
        description: 'With just a click, preview what a judge will see at a competition before it happens. No more testing a Google Drive link to ensure your notebook can be viewed.',
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?q=80&w=3543&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        name: 'Easy competition submissions',
        icon: <Send/>,
        description: 'EngScribe keeps a live link to your notebook for the entire season, so coaches do not need to change the link in RobotEvents week after week when the notebook updates.',
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        name: 'Automatic table of contents',
        icon: <AlignJustify/>,
        description: 'Keep your table of contents automatically, letting judges see your table of contents no matter where they are in viewing the notebook.',
        image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    {
        name: 'Notebook entry tagging',
        icon: <Tag/>,
        description: 'Want to draw attention to a specific page of the notebook? Just add a tag, ensuring the judge will not miss your most important pages.',
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=3870&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    },
    // {
    //     name: 'Speedy loading',
    //     description: 'Avoid the scrolling doom of your 300-page notebook. EngScribe loads quickly every single time — no matter if your notebook is three pages or 300.'
    // },
    // {
    //     name: 'Easy PDF exports',
    //     description: 'Need to bring a physical notebook to a competition? In EngScribe, competitors and judges can download with ease.' },
    // {
    //     name: 'Custom team portal',
    //     description: 'When a judge opens your notebook, let them see exactly what you want to see. Add custom information in the sidebar to give the judges additional information about your team.',
    // }
]

export default function Features() {

    const [selectedFeature,setSelectedFeature] = useState<string>(features[0].name);


    return (
        // <div id={"features_section"} className="py-24 sm:py-32">
        //     <div className="mx-auto max-w-7xl px-6 lg:px-8">
        //         <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
        //             <div>
        //                 <h2 className="text-base font-semibold leading-7 text-blue-600">Everything you need</h2>
        //                 <p className="mt-2 text-3xl font-bold tracking-tight text-gray-600 sm:text-4xl">Built for all robotics teams</p>
        //                 <p className="mt-6 text-base leading-7 text-gray-400">
        //                     No matter how you complete your notebook, EngScribe ensures your team is ready to compete for judged awards at any competition.
        //                 </p>
        //             </div>
        //             <dl className="col-span-2 grid grid-cols-1 gap-x-8 gap-y-10 text-base leading-7 text-gray-600 sm:grid-cols-2 lg:gap-y-16">
        //                 {features.map((feature) => (
        //                     <div key={feature.name} className="relative pl-9">
        //                         <dt className="font-semibold text-gray-100">
        //                             <CheckIcon aria-hidden="true" className="absolute left-0 top-1 h-5 w-5 text-blue-500" />
        //                             {feature.name}
        //                         </dt>
        //                         <dd className="mt-2 text-gray-400">{feature.description}</dd>
        //                     </div>
        //                 ))}
        //             </dl>
        //         </div>
        //     </div>
        // </div>
        <div id={"features_section"} className={"py-10"}>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto grid max-w-2xl grid-cols-2 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none">
                    <div className={"col-start-1 space-y-4 pr-10"}>
                        {features.map((feature) => (
                            <div
                                key={feature.name}
                                // className={`hover:border-solid border-2 border-transparent hover:border-blue-50 hover:bg-blue-50 rounded-lg px-5 py-4 cursor-pointer ${
                                //     selectedFeature === feature.name ? 'hover:border-blue-100 border-blue-100 bg-blue-50' : ''
                                // }`}
                                className={`border-2 rounded-lg px-5 py-4 cursor-pointer ${
                                    selectedFeature === feature.name
                                        ? 'border-blue-100 bg-blue-50'
                                        : 'border-transparent hover:bg-blue-50'
                                } ${selectedFeature === feature.name ? 'hover:border-blue-100' : ''}`}
                                onClick={() => setSelectedFeature(feature.name)}
                            >
                                <div className={"flex gap-4"}>
                                    {feature.icon}
                                    <h1 className={"font-bold text-xl"}>{feature.name}</h1>
                                </div>
                                <p className={"pt-1.5 text-gray-600 text-sm"}>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                    <div className={"col-start-2 flex justify-center py-3.5"}>
                        <img
                            src={features.find(feature => feature.name === selectedFeature)?.image}
                            alt="test"
                            className={"rounded-lg shadow-lg object-cover"}
                        ></img>
                    </div>
                </div>
            </div>
        </div>
    )
}