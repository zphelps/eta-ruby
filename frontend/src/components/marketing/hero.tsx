import {ChevronRightIcon, Rocket} from "lucide-react";
import {Button} from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {

    return (
        <div className="relative isolate overflow-hidden">
            <div className="items-center mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40">
                <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-2xl lg:flex-shrink-0">
              {/*      <div className="">*/}
              {/*          <a href="#" className="inline-flex space-x-6">*/}
              {/*/!*<span*!/*/}
              {/*/!*    className="rounded-full bg-blue-600/10 px-3 py-1 text-sm font-semibold leading-6 text-blue-600 ring-1 ring-inset ring-blue-600/10">*!/*/}
              {/*/!*  {"What's new"}*!/*/}
              {/*/!*</span>*!/*/}
              {/*/!*              <span*!/*/}
              {/*/!*                  className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-slate-600">*!/*/}
              {/*/!*  /!*<span>Just shipped v1.0</span>*!/*!/*/}
              {/*/!*  /!*<ChevronRightIcon aria-hidden="true" className="h-5 w-5 text-slate-400"/>*!/*!/*/}
              {/*/!*</span>*!/*/}
              {/*          </a>*/}
              {/*      </div>*/}
                    <h1 className="mt-10 text-6xl font-extrabold tracking-tight leading-tight">
                        The notebook platform <span className={'bg-blue-400 bg-opacity-15 text-blue-600 rotate-45'}>built specifically for robotics</span>
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-slate-500">
                        EngScribe makes handling your notebook as simple as ever. As the only platform built
                        specifically for VEX Robotics/REC Foundation-accredited robotics competitions, EngScribe
                        organizes award-winning notebooks — from your first team meeting to the World Championship.
                    </p>
                    <div className="mt-8 space-y-4">
                        <Link href="/auth/signup">
                            <Button
                                className="rounded-xl bg-blue-600 px-8 py-6 text-white shadow-sm hover:bg-blue-500"
                            >
                                <Rocket className="h-5 w-5 mr-3"/>
                                <p className={''}>
                                    Start your notebook
                                </p>
                            </Button>
                        </Link>
                        <p>
                            <span className={'font-bold text-blue-500'}>$25 off</span> until the end of the year!
                        </p>
                    </div>
                </div>
                <div
                    className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
                    <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                        <div
                            className="bg-slate-700 rounded-4xl w-[500px] h-[500px] bg-slate-900/5">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
