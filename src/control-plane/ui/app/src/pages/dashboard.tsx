import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import { Disclosure, Menu, Transition } from "@headlessui/react";
import request from "graphql-request";
import { useQuery } from "@tanstack/react-query";
import {
  BarsArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  RectangleStackIcon,
} from "@heroicons/react/20/solid";
import { Bars3CenterLeftIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { graphql } from "../../gql";
import NewAppSidePanel from "../components/NewAppSidePanel";
import { ApplicationStatus, ApplicationType } from "../../gql/graphql";
import { HeadFC } from "gatsby";
import { useLocalStorage } from "react-use";
//@ts-ignore image doesn't have types
import image from "../images/notlify-logo-rectangle.png";

const allApps = graphql(/* GraphQL */ `
  query ListAllApplications {
    listApplications {
      customerId
      id
      name
      region
      repository
      lastDeploymentTime
      deploymentUrl
      description
      applicationType
      status
    }
  }
`);

function timeAgo(value: string) {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(value).getTime()) / 1000
  );
  let interval = seconds / 31536000;
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  if (interval > 1) {
    return rtf.format(-Math.floor(interval), "year");
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return rtf.format(-Math.floor(interval), "month");
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return rtf.format(-Math.floor(interval), "day");
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return rtf.format(-Math.floor(interval), "hour");
  }
  interval = seconds / 60;
  if (interval > 1) {
    return rtf.format(-Math.floor(interval), "minute");
  }
  return rtf.format(-Math.floor(interval), "second");
}

const navigation = [{ name: "Dashboard", href: "/", current: true }];
const userNavigation = [
  { name: "Your Profile", href: "#" },
  { name: "Settings", href: "#" },
  { name: "Sign out", href: "#" },
];

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

enum State {
  Initialized,
  NewApplicationSelected,
}

const applicationTypeToFriendlyName = (value: ApplicationType) => {
  switch (value) {
    case ApplicationType.NextJs:
      return "Next.js";
    case ApplicationType.Astro:
      return "Astro";
    case ApplicationType.Remix:
      return "Remix";
    case ApplicationType.Solid:
      return "SolidJS";
    case ApplicationType.Static:
      return "Static Website";
  }
};

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

const DashboardPage = () => {
  const [state, setState] = useState(State.Initialized);
  const [token] = useLocalStorage<string>("notlify:token");
  const parsedToken = token ? parseJwt(token) : undefined;
  const user: {
    name: string;
    login: string;
    avatar_url: string;
  } = parsedToken;
  const isAuthenticated = !!parsedToken;

  const { data } = useQuery(
    ["apps"],
    async () => {
      return request(
        "https://vt2t2uctaf.execute-api.us-east-1.amazonaws.com/api",
        allApps,
        undefined,
        {
          Authorization: `Bearer ${token}`,
        }
      );
    },
    {
      refetchInterval: 10000,
      enabled: isAuthenticated,
    }
  );
  useEffect(() => {
    if (!isAuthenticated) {
      // loginWithRedirect();
      window.location.href =
        "https://github.com/login/oauth/authorize?client_id=30ccac4ed61bccc390fe&redirect_uri=https://vt2t2uctaf.execute-api.us-east-1.amazonaws.com/github/callback&scope=openid user&state=blah&allow_signup=false";
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return <></>;
  }
  const applications = data?.listApplications ?? [];
  const sortedApplications = applications.sort((a, b) => {
    if (
      [
        ApplicationStatus.CreateRequested,
        ApplicationStatus.DeploymentInitiated,
      ].includes(a.status)
    ) {
      return -1;
    }
    if (
      [
        ApplicationStatus.CreateRequested,
        ApplicationStatus.DeploymentInitiated,
      ].includes(b.status)
    ) {
      return 1;
    }
    return (
      new Date(b?.lastDeploymentTime ?? 0)?.getTime() -
      new Date(a?.lastDeploymentTime ?? 0)?.getTime()
    );
  });

  const activityItems = sortedApplications
    .filter(
      (application) =>
        application.status === ApplicationStatus.DeploymentComplete
    )
    .map((application) => ({
      application: application.name,
      commit: "2d89f0c8",
      environment: "production",
      time: timeAgo(application.lastDeploymentTime!),
    }));
  return (
    <>
      <div className="relative flex flex-col min-h-full">
        {/* Navbar */}
        <Disclosure as="nav" className="flex-shrink-0 bg-gray-100">
          {({ open }) => (
            <>
              <div className="px-2 mx-auto max-w-7xl sm:px-4 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                  {/* Logo section */}
                  <div className="flex items-center px-2 lg:px-0 xl:w-64">
                    <div className="flex-shrink-0">
                      <img className="h-12 w-36" src={image} alt="Notlify" />
                    </div>
                  </div>

                  {/* Search section */}
                  <div className="flex justify-center flex-1 lg:justify-end">
                    <div className="w-full px-2 lg:px-6">
                      <label htmlFor="search" className="sr-only">
                        Search applications
                      </label>
                      <div className="relative text-cyan-600 focus-within:text-gray-400">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                          <MagnifyingGlassIcon
                            className="w-5 h-5"
                            aria-hidden="true"
                          />
                        </div>
                        <input
                          id="search"
                          name="search"
                          className="block w-full py-2 pl-10 pr-3 leading-5 text-gray-600 placeholder-gray-600 bg-white border border-transparent rounded-md focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none focus:ring-0 sm:text-sm"
                          placeholder="Search applications"
                          type="search"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:hidden">
                    {/* Mobile menu button */}
                    <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md bg-cyan-600 text-cyan-400 hover:bg-cyan-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-600">
                      <span className="sr-only">Open main menu</span>
                      {open ? (
                        <XMarkIcon
                          className="block w-6 h-6"
                          aria-hidden="true"
                        />
                      ) : (
                        <Bars3CenterLeftIcon
                          className="block w-6 h-6"
                          aria-hidden="true"
                        />
                      )}
                    </Disclosure.Button>
                  </div>
                  {/* Links section */}
                  <div className="hidden lg:block lg:w-80">
                    <div className="flex items-center justify-end">
                      <div className="flex">
                        {navigation.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="px-3 py-2 text-sm font-medium rounded-md text-cyan-600 hover:text-white"
                            aria-current={item.current ? "page" : undefined}
                          >
                            {item.name}
                          </a>
                        ))}
                      </div>
                      {/* Profile dropdown */}
                      <Menu as="div" className="relative flex-shrink-0 ml-4">
                        <div>
                          <Menu.Button className="flex text-sm text-white rounded-full bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-cyan-700">
                            <span className="sr-only">Open user menu</span>
                            <img
                              className="w-8 h-8 rounded-full"
                              src={user?.avatar_url}
                              alt=""
                            />
                          </Menu.Button>
                        </div>
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-100"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-75"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                            {userNavigation.map((item) => (
                              <Menu.Item key={item.name}>
                                {({ active }) => (
                                  <a
                                    href={item.href}
                                    className={classNames(
                                      active ? "bg-gray-100" : "",
                                      "block px-4 py-2 text-sm text-gray-700"
                                    )}
                                  >
                                    {item.name}
                                  </a>
                                )}
                              </Menu.Item>
                            ))}
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>

              <Disclosure.Panel className="lg:hidden">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {navigation.map((item) => (
                    <Disclosure.Button
                      key={item.name}
                      as="a"
                      href={item.href}
                      className={classNames(
                        item.current
                          ? "text-white bg-cyan-800"
                          : "text-cyan-200 hover:text-cyan-100 hover:bg-cyan-600",
                        "block px-3 py-2 rounded-md text-base font-medium"
                      )}
                      aria-current={item.current ? "page" : undefined}
                    >
                      {item.name}
                    </Disclosure.Button>
                  ))}
                </div>
                <div className="pt-4 pb-3 border-t border-cyan-800">
                  <div className="px-2 space-y-1">
                    {userNavigation.map((item) => (
                      <Disclosure.Button
                        key={item.name}
                        as="a"
                        href={item.href}
                        className="block px-3 py-2 text-base font-medium rounded-md text-cyan-200 hover:bg-cyan-600 hover:text-cyan-100"
                      >
                        {item.name}
                      </Disclosure.Button>
                    ))}
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* 3 column wrapper */}
        <div className="flex-grow w-full mx-auto max-w-7xl lg:flex xl:px-8">
          {/* Left sidebar & main wrapper */}
          <div className="flex-1 min-w-0 bg-white xl:flex">
            {/* Account profile */}
            <div className="bg-white xl:w-64 xl:flex-shrink-0 xl:border-r xl:border-gray-200">
              <div className="py-6 pl-4 pr-6 sm:pl-6 lg:pl-8 xl:pl-0">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-8">
                    <div className="space-y-8 sm:flex sm:items-center sm:justify-between sm:space-y-0 xl:block xl:space-y-8">
                      {/* Profile */}
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-12 h-12">
                          <img
                            className="w-12 h-12 rounded-full"
                            src={user?.avatar_url}
                            alt=""
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">
                            {user?.name}
                          </div>
                          <a
                            href="#"
                            className="group flex items-center space-x-2.5"
                          >
                            <svg
                              className="w-5 h-5 text-gray-400 group-hover:text-gray-500"
                              aria-hidden="true"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-sm font-medium text-gray-500 group-hover:text-gray-900">
                              {user?.login}
                            </span>
                          </a>
                        </div>
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-col sm:flex-row xl:flex-col">
                        <button
                          onClick={() => setState(State.NewApplicationSelected)}
                          type="button"
                          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 xl:w-full"
                        >
                          New Application
                        </button>
                      </div>
                    </div>
                    {/* Meta info */}
                    <div className="flex flex-col space-y-6 sm:flex-row sm:space-y-0 sm:space-x-8 xl:flex-col xl:space-x-0 xl:space-y-6">
                      <div className="flex items-center space-x-2">
                        <RectangleStackIcon
                          className="w-5 h-5 text-gray-400"
                          aria-hidden="true"
                        />
                        <span className="text-sm font-medium text-gray-500">
                          {sortedApplications.length} Applications
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white lg:min-w-0 lg:flex-1">
              <div className="pt-4 pb-4 pl-4 pr-6 border-t border-b border-gray-200 sm:pl-6 lg:pl-8 xl:border-t-0 xl:pl-6 xl:pt-6">
                <div className="flex items-center">
                  <h1 className="flex-1 text-lg font-medium">Applications</h1>
                  <Menu as="div" className="relative">
                    <Menu.Button className="inline-flex justify-center w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2">
                      <BarsArrowUpIcon
                        className="w-5 h-5 mr-3 text-gray-400"
                        aria-hidden="true"
                      />
                      Sort
                      <ChevronDownIcon
                        className="ml-2.5 -mr-1.5 h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </Menu.Button>
                    <Menu.Items className="absolute right-0 z-10 w-56 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Name
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Date modified
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active
                                  ? "bg-gray-100 text-gray-900"
                                  : "text-gray-700",
                                "block px-4 py-2 text-sm"
                              )}
                            >
                              Date created
                            </a>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Menu>
                </div>
              </div>
              <ul
                role="list"
                className="border-b border-gray-200 divide-y divide-gray-200"
              >
                {sortedApplications.map((application) => (
                  <li
                    key={application?.repository}
                    className="relative py-5 pl-4 pr-6 hover:bg-gray-50 sm:py-6 sm:pl-6 lg:pl-8 xl:pl-6"
                  >
                    <div className="flex items-center justify-between space-x-4">
                      {/* Repo name and link */}
                      <div className="min-w-0 space-y-3">
                        <div className="flex items-center space-x-3">
                          {[
                            ApplicationStatus.CreateComplete,
                            ApplicationStatus.DeploymentComplete,
                          ].includes(application.status) && (
                            <span
                              className="flex items-center justify-center w-4 h-4 bg-green-100 rounded-full"
                              aria-hidden="true"
                            >
                              <span className="w-2 h-2 bg-green-400 rounded-full" />
                            </span>
                          )}
                          {[
                            ApplicationStatus.CreateRequested,
                            ApplicationStatus.DeploymentInitiated,
                          ].includes(application.status) && (
                            <span
                              className="flex items-center justify-center w-4 h-4 bg-yellow-100 rounded-full"
                              aria-hidden="true"
                            >
                              <span className="w-2 h-2 bg-yellow-400 rounded-full" />
                            </span>
                          )}
                          {[
                            ApplicationStatus.CreateFailed,
                            ApplicationStatus.DeploymentFailed,
                          ].includes(application.status) && (
                            <span
                              className="flex items-center justify-center w-4 h-4 bg-red-100 rounded-full"
                              aria-hidden="true"
                            >
                              <span className="w-2 h-2 bg-red-400 rounded-full" />
                            </span>
                          )}

                          <h2 className="text-sm font-medium">
                            <a href={`/applications/${application.name}`}>
                              <span
                                className="absolute inset-0"
                                aria-hidden="true"
                              />
                              {application.name}{" "}
                              <span className="sr-only">Running</span>
                            </a>
                          </h2>
                          <p className="text-sm font-light">
                            {application.description}
                          </p>
                        </div>
                        <a
                          href={`https://github.com/${application.repository}`}
                          className="group relative flex items-center space-x-2.5"
                        >
                          <svg
                            className="flex-shrink-0 w-5 h-5 text-gray-400 group-hover:text-gray-500"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            aria-hidden="true"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M8.99917 0C4.02996 0 0 4.02545 0 8.99143C0 12.9639 2.57853 16.3336 6.15489 17.5225C6.60518 17.6053 6.76927 17.3277 6.76927 17.0892C6.76927 16.8762 6.76153 16.3104 6.75711 15.5603C4.25372 16.1034 3.72553 14.3548 3.72553 14.3548C3.31612 13.316 2.72605 13.0395 2.72605 13.0395C1.9089 12.482 2.78793 12.4931 2.78793 12.4931C3.69127 12.5565 4.16643 13.4198 4.16643 13.4198C4.96921 14.7936 6.27312 14.3968 6.78584 14.1666C6.86761 13.5859 7.10022 13.1896 7.35713 12.965C5.35873 12.7381 3.25756 11.9665 3.25756 8.52116C3.25756 7.53978 3.6084 6.73667 4.18411 6.10854C4.09129 5.88114 3.78244 4.96654 4.27251 3.72904C4.27251 3.72904 5.02778 3.48728 6.74717 4.65082C7.46487 4.45101 8.23506 4.35165 9.00028 4.34779C9.76494 4.35165 10.5346 4.45101 11.2534 4.65082C12.9717 3.48728 13.7258 3.72904 13.7258 3.72904C14.217 4.96654 13.9082 5.88114 13.8159 6.10854C14.3927 6.73667 14.7408 7.53978 14.7408 8.52116C14.7408 11.9753 12.6363 12.7354 10.6318 12.9578C10.9545 13.2355 11.2423 13.7841 11.2423 14.6231C11.2423 15.8247 11.2313 16.7945 11.2313 17.0892C11.2313 17.3299 11.3937 17.6097 11.8501 17.522C15.4237 16.3303 18 12.9628 18 8.99143C18 4.02545 13.97 0 8.99917 0Z"
                              fill="currentcolor"
                            />
                          </svg>
                          <span className="text-sm font-medium text-gray-500 truncate group-hover:text-gray-900">
                            {application.repository}
                          </span>
                        </a>
                      </div>
                      <div className="sm:hidden">
                        <ChevronRightIcon
                          className="w-5 h-5 text-gray-400"
                          aria-hidden="true"
                        />
                      </div>
                      {/* Repo meta info */}
                      <div className="flex-col items-end flex-shrink-0 hidden space-y-3 sm:flex">
                        <p className="flex items-center space-x-4">
                          {application.deploymentUrl && (
                            <a
                              href={application.deploymentUrl}
                              className="relative text-sm font-medium text-gray-500 hover:text-gray-900"
                            >
                              Visit site
                            </a>
                          )}
                        </p>

                        <p className="flex space-x-2 text-sm text-gray-500">
                          <span>
                            {applicationTypeToFriendlyName(
                              application.applicationType
                            )}
                          </span>
                          <span aria-hidden="true">&middot;</span>
                          {ApplicationStatus.CreateRequested ===
                            application.status && (
                            <>
                              <span>Creating...</span>
                            </>
                          )}
                          {ApplicationStatus.DeploymentInitiated ===
                            application.status && (
                            <>
                              <span>Deploying...</span>
                            </>
                          )}
                          {ApplicationStatus.DeploymentComplete ===
                            application.status && (
                            <>
                              <span>
                                Deployed{" "}
                                {timeAgo(application.lastDeploymentTime!)}
                              </span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* Activity feed */}
          <div className="pr-4 sm:pr-6 lg:flex-shrink-0 lg:border-l lg:border-gray-200 lg:pr-8 xl:pr-0">
            <div className="pl-6 lg:w-80">
              <div className="pt-6 pb-2">
                <h2 className="text-sm font-semibold">Activity</h2>
              </div>
              <div>
                <ul role="list" className="divide-y ">
                  {activityItems.map((item) => (
                    <li key={item.commit} className="py-4">
                      <div className="flex space-x-3">
                        <img
                          className="w-6 h-6 rounded-full"
                          src={user?.avatar_url}
                          alt=""
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium">You</h3>
                            <p className="text-sm text-gray-500">{item.time}</p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Deployed {item.application} ({item.commit} in
                            master) to {item.environment}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="py-4 text-sm border-t border-gray-200">
                  <a
                    href="#"
                    className="font-semibold text-cyan-600 hover:text-cyan-900"
                  >
                    View all activity
                    <span aria-hidden="true"> &rarr;</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <NewAppSidePanel
        user={user}
        isOpen={state === State.NewApplicationSelected}
        onClose={() => setState(State.Initialized)}
      />
    </>
  );
};

export default DashboardPage;

export const Head: HeadFC = () => <title>Notlify — Dashboard</title>;
