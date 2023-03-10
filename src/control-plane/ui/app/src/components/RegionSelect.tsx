import React, { Fragment, useState } from "react";
import { Listbox, Transition } from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { AvailableRegions } from "../../gql/graphql";

function classNames(...classes: any[]) {
  return classes.filter(Boolean).join(" ");
}
const regions = [
  {
    id: AvailableRegions.UsEast_1,
    name: "us-east-1",
  },
  {
    id: AvailableRegions.UsEast_2,
    name: "us-east-2",
  },
  {
    id: AvailableRegions.UsWest_1,
    name: "us-west-1",
  },
  {
    id: AvailableRegions.UsWest_2,
    name: "us-west-2",
  },
];
interface RegionSelectProps {
  selectedRegion: AvailableRegions;
  onSelect: (repo: AvailableRegions) => void;
}

export default function RegionSelect({
  selectedRegion,
  onSelect,
}: RegionSelectProps) {
  return (
    <Listbox value={selectedRegion} onChange={onSelect}>
      {({ open }) => (
        <>
          <Listbox.Label className="block text-sm font-medium text-gray-700">
            Region
          </Listbox.Label>
          <div className="relative mt-1">
            <Listbox.Button className="relative w-full py-2 pl-3 pr-10 text-left bg-white border border-gray-300 rounded-md shadow-sm cursor-default focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm">
              <span className="block truncate">
                {regions.find((region) => region.id === selectedRegion)?.name}
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
                {regions.map((region) => (
                  <Listbox.Option
                    key={region.id}
                    className={({ active }) =>
                      classNames(
                        active ? "text-white bg-indigo-600" : "text-gray-900",
                        "relative cursor-default select-none py-2 pl-3 pr-9"
                      )
                    }
                    value={region.id}
                  >
                    {({ selected, active }) => (
                      <>
                        <span
                          className={classNames(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {region.name}
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
