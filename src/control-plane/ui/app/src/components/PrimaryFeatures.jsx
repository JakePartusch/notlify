import * as React from "react";
import { useEffect, useState } from "react";
import { Tab } from "@headlessui/react";
import clsx from "clsx";

import { Container } from "./Container";
import screenshotNotlify from "../images/screenshots/notlify.png";
import screenshotGithub from "../images/screenshots/github.png";
import screenshotGithubAction from "../images/screenshots/github-action.png";

const features = [
  {
    title: "Isolated Deployments",
    description:
      "Each of your websites are deployed as standalone AWS resources. Isolated, single-tenant deployments!",
    image: screenshotNotlify,
  },
  {
    title: "Open Source",
    description: "The entire platform is open-source. Transparency is key.",
    image: screenshotGithub,
  },
  {
    title: "GitHub Support",
    description:
      "GitHub actions support, so you can hook into your current build pipeline",
    image: screenshotGithubAction,
  },
  {
    title: "Global CDN",
    description:
      "Your website will be globally distributed with Amazon Cloudfront.",
    image: screenshotNotlify,
  },
];

export function PrimaryFeatures() {
  let [tabOrientation, setTabOrientation] = useState("horizontal");

  useEffect(() => {
    let lgMediaQuery = window.matchMedia("(min-width: 1024px)");

    function onMediaQueryChange({ matches }) {
      setTabOrientation(matches ? "vertical" : "horizontal");
    }

    onMediaQueryChange(lgMediaQuery);
    lgMediaQuery.addEventListener("change", onMediaQueryChange);

    return () => {
      lgMediaQuery.removeEventListener("change", onMediaQueryChange);
    };
  }, []);

  return (
    <section
      id="features"
      aria-label="Features for running your books"
      className="relative pt-20 overflow-hidden bg-cyan-600 pb-28 sm:py-32"
    >
      <Container className="relative">
        <div className="max-w-2xl md:mx-auto md:text-center xl:max-w-none">
          <h2 className="text-3xl tracking-tight text-white font-display sm:text-4xl md:text-5xl">
            Everything you need to ship your site
          </h2>
          <p className="mt-6 text-lg tracking-tight text-cyan-100">
            Open Source, GitHub integration, CDN support, and more
          </p>
        </div>
        <Tab.Group
          as="div"
          className="grid items-center grid-cols-1 pt-10 mt-16 gap-y-2 sm:gap-y-6 md:mt-20 lg:grid-cols-12 lg:pt-0"
          vertical={tabOrientation === "vertical"}
        >
          {({ selectedIndex }) => (
            <>
              <div className="flex pb-4 -mx-4 overflow-x-auto sm:mx-0 sm:overflow-visible sm:pb-0 lg:col-span-5">
                <Tab.List className="relative z-10 flex px-4 gap-x-4 whitespace-nowrap sm:mx-auto sm:px-0 lg:mx-0 lg:block lg:gap-x-0 lg:gap-y-1 lg:whitespace-normal">
                  {features.map((feature, featureIndex) => (
                    <div
                      key={feature.title}
                      className={clsx(
                        "group relative rounded-full py-1 px-4 lg:rounded-r-none lg:rounded-l-xl lg:p-6",
                        selectedIndex === featureIndex
                          ? "bg-white lg:bg-white/10 lg:ring-1 lg:ring-inset lg:ring-white/10"
                          : "hover:bg-white/10 lg:hover:bg-white/5"
                      )}
                    >
                      <h3>
                        <Tab
                          className={clsx(
                            "font-display text-lg [&:not(:focus-visible)]:focus:outline-none",
                            selectedIndex === featureIndex
                              ? "text-cyan-600 lg:text-white"
                              : "text-cyan-100 hover:text-white lg:text-white"
                          )}
                        >
                          <span className="absolute inset-0 rounded-full lg:rounded-r-none lg:rounded-l-xl" />
                          {feature.title}
                        </Tab>
                      </h3>
                      <p
                        className={clsx(
                          "mt-2 hidden text-sm lg:block",
                          selectedIndex === featureIndex
                            ? "text-white"
                            : "text-cyan-100 group-hover:text-white"
                        )}
                      >
                        {feature.description}
                      </p>
                    </div>
                  ))}
                </Tab.List>
              </div>
              <Tab.Panels className="lg:col-span-7">
                {features.map((feature) => (
                  <Tab.Panel key={feature.title} unmount={false}>
                    <div className="relative sm:px-6 lg:hidden">
                      <div className="absolute -inset-x-4 top-[-6.5rem] bottom-[-4.25rem] bg-white/10 ring-1 ring-inset ring-white/10 sm:inset-x-0 sm:rounded-t-xl" />
                      <p className="relative max-w-2xl mx-auto text-base text-white sm:text-center">
                        {feature.description}
                      </p>
                    </div>
                    <div className="mt-10 w-[45rem] overflow-hidden rounded-xl bg-slate-50 shadow-xl shadow-cyan-900/20 sm:w-auto lg:mt-0 lg:w-[67.8125rem]">
                      <img
                        className="w-full"
                        src={feature.image}
                        alt={feature.description}
                        layout="fullWidth"
                      />
                    </div>
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </>
          )}
        </Tab.Group>
      </Container>
    </section>
  );
}
