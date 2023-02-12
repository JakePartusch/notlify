import { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { ApplicationType } from "gql/graphql";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}

const applicationTypes = [
  {
    id: ApplicationType.Astro,
    name: "Astro",
  },
  {
    id: ApplicationType.NextJs,
    name: "Next.js",
  },
  {
    id: ApplicationType.Remix,
    name: "Remix",
  },
  {
    id: ApplicationType.Solid,
    name: "SolidJS",
  },
  {
    id: ApplicationType.Static,
    name: "Static Website",
  },
];

interface ApplicationTypeSelectProps {
  selectedApplicationType: ApplicationType;
  onSelect: (repo: ApplicationType) => void;
}

export default function ApplicationTypeSelect({
  selectedApplicationType,
  onSelect,
}: ApplicationTypeSelectProps) {
  return (
    <Listbox value={selectedApplicationType} onChange={onSelect}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">
            Application Type
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">
                {
                  applicationTypes.find(
                    (applicationType) =>
                      applicationType.id === selectedApplicationType
                  )?.name
                }
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronUpDownIcon
                  className="w-5 h-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </Listbox.Button>

            <Transition
              show={open}
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="absolute z-10 w-full py-1 mt-1 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {applicationTypes.map((applicationType) => (
                  <Listbox.Option
                    key={applicationType.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={applicationType.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {applicationType.name}
                        </span>

                        {selected ? (
                          <span
                            className={classNames(
                              active ? "text-white" : "text-indigo-600",
                              "absolute inset-y-0 right-0 flex items-center pr-4"
                            )}
                          >
                            <CheckIcon className="w-5 h-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </div>
        </>
      )}
    </Listbox>
  );
}
