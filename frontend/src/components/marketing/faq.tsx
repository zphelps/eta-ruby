import {Disclosure, DisclosureButton, DisclosurePanel} from "@headlessui/react";
import {MinusIcon, PlusIcon} from "@heroicons/react/24/solid";

const faqs = [
    {
        question: "Why is EngScribe better than Google Drive or Dropbox?",
        answer:
            "EngScribe is more than just a PDF viewer; it is the ultimate viewing window and notebook organization notebook tool available. With EngScribe, judges will be able to view your notebook and your table of contents at the same time. Also, EngScribe solves the file-size problem. Engineering notebook files get large quickly. Google Drive and Dropbox often stop showing document previews when the files get too big. Using EngScribe, your notebook will always appear, no matter of length.",
    },
    {
        question: "Why does EngScribe cost money?",
        answer:
            "The EngScribe development team is made up of former competitors in VEX Robotics, and managing the platform takes a significant amount of time. Additionally, server costs to store the engineering notebooks are not cheap.",
    },
    {
        question: "My school doesn't let me pay with a credit card. Can I still purchase access to EngScribe?",
        answer:
            "Of course! EngScribe accepts purchase orders, checks, and other forms of payment. Contact us to learn more.",
    },
    {
        question: "I mentor multiple teams. Do you offer discounts for large organizations?",
        answer:
            "Yes, EngScribe offers discount codes to organizations that sign up more than six teams. We define a single organization by the team number lsited on RobotEvents. To request a discount code, please contact us.",
    },
    // More questions...
]

export default function FAQ() {
    return (
        <div id={"faq_section"} className="bg-white">
            <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-28">
                <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
                    <h2 className="text-2xl font-bold leading-10 tracking-tight text-gray-900">Frequently asked
                        questions</h2>
                    <dl className="mt-10 space-y-6 divide-y divide-gray-900/10">
                        {faqs.map((faq) => (
                            <Disclosure key={faq.question} as="div" className="pt-6">
                                <dt>
                                    <DisclosureButton
                                        className="group flex w-full items-start justify-between text-left text-gray-900">
                                        <span className="text-base font-semibold leading-7">{faq.question}</span>
                                        <span className="ml-6 flex h-7 items-center">
                      <PlusIcon aria-hidden="true" className="h-6 w-6 group-data-[open]:hidden"/>
                      <MinusIcon aria-hidden="true" className="h-6 w-6 [.group:not([data-open])_&]:hidden"/>
                    </span>
                                    </DisclosureButton>
                                </dt>
                                <DisclosurePanel as="dd" className="mt-2 pr-12">
                                    <p className="text-base leading-7 text-gray-600">{faq.answer}</p>
                                </DisclosurePanel>
                            </Disclosure>
                        ))}
                    </dl>
                </div>
            </div>
        </div>
    )
}
