"use client";
import {redirect} from "next/navigation";
import Header from "@/components/marketing/header";
import Hero from "@/components/marketing/hero";
import Features from "@/components/marketing/features";
import Pricing from "@/components/marketing/pricing";
import Testimonials from "@/components/marketing/testimonials";
import Footer from "@/components/marketing/footer";

export default function Home() {
    // redirect('/editor');

    return (
      <section className={'container'}>
          <Header/>
          <Hero/>
          <Features/>
          <Pricing/>
          <Testimonials/>
          {/*<FAQ/>*/}
          <Footer/>
      </section>
    );
}
