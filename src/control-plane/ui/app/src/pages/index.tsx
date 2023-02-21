import * as React from "react";
import { HeadFC } from "gatsby";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { PrimaryFeatures } from "../components/PrimaryFeatures";

const IndexPage = () => {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <PrimaryFeatures />
      </main>
      <Footer />
    </>
  );
};

export default IndexPage;

export const Head: HeadFC = () => <title>Notlify — Home</title>;
