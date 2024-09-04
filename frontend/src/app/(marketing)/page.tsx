"use client";
import {redirect} from "next/navigation";

export default function Home() {
    redirect('/editor');

    // return (
    //   <section className={'container'}>
    //       <Header/>
    //       <Hero/>
    //       <Features/>
    //       <Pricing/>
    //       <Testimonials/>
    //       {/*<FAQ/>*/}
    //       <Footer/>
    //   </section>
    // );
}
