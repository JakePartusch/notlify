import Head from "next/head";

import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { PrimaryFeatures } from "@/components/PrimaryFeatures";

export default function Home() {
  return (
    <>
      <Head>
        <title>Notlify - Like Netlify, but... not</title>
        <meta
          name="description"
          content="An open-source Netlify-like platform for hosting static websites"
        />
      </Head>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
      </main>
      <Footer />
    </>
  );
}
