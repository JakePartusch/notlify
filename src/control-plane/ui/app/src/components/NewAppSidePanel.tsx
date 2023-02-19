import { FormEvent, Fragment, useEffect, useState } from "react";
import request from "graphql-request";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth0 } from "@auth0/auth0-react";
import ReposCombobox from "./ReposCombobox";
import RegionSelect from "./RegionSelect";
import ApplicationTypeSelect from "./ApplicationTypeSelect";
import { graphql } from "../../gql";
import { useMutation } from "@tanstack/react-query";
import { ApplicationType, AvailableRegions } from "gql/graphql";

interface NewAppSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const createApplicationMutation = graphql(/* GraphQL */ `
  mutation Mutation($input: CreateApplicationInput!) {
    createApplication(input: $input) {
      id
      apiKey
    }
  }
`);

export default function NewAppSidePanel({
  isOpen,
  onClose,
}: NewAppSidePanelProps) {
  const [repos, setRepos] = useState([]);
  const { user, getIdTokenClaims } = useAuth0();
  const [repository, setRepository] = useState("");
  const [description, setDestription] = useState("");
  const [applicationType, setApplicationType] = useState(
    ApplicationType.Static
  );
  const [region, setRegion] = useState(AvailableRegions.UsWest_2);

  useEffect(() => {
    const listRepos = async () => {
      if (user) {
        const response = await fetch(
          `https://api.github.com/users/${user.nickname}/repos`
        );
        const repos = await response.json();
        const sortedRepos = repos
          .sort((a: any, b: any) => {
            return (
              new Date(b.updated_at).getTime() -
              new Date(a.updated_at).getTime()
            );
          })
          .map((repo: any) => repo.name);
        setRepos(repos);
      }
    };
    listRepos();
  }, [user]);

  const createApplication = useMutation(async () => {
    const idToken = await getIdTokenClaims();
    return request(
      "https://600376vtqg.execute-api.us-east-1.amazonaws.com/api",
      createApplicationMutation,
      {
        input: {
          repository: `${user?.nickname}/${repository}`,
          name: repository,
          applicationType,
          description,
          region,
        },
      },
      {
        Authorization: `Bearer ${idToken?.__raw}`,
      }
    );
  });

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const response = await createApplication.mutateAsync();
    console.log(response);
    //TODO: loader
    onClose();
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 pointer-events-none sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="w-screen max-w-md pointer-events-auto">
                  <form
                    className="flex flex-col h-full bg-white divide-y divide-gray-200 shadow-xl"
                    onSubmit={onSubmit}
                  >
                    <div className="flex-1 h-0 overflow-y-auto">
                      <div className="px-4 py-6 bg-cyan-700 sm:px-6">
                        <div className="flex items-center justify-between">
                          <Dialog.Title className="text-lg font-medium text-white">
                            New Applicaton
                          </Dialog.Title>
                          <div className="flex items-center ml-3 h-7">
                            <button
                              type="button"
                              className="rounded-md bg-cyan-700 text-cyan-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                              onClick={() => onClose()}
                            >
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="w-6 h-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                        <div className="mt-1">
                          <p className="text-sm text-cyan-300">
                            Get started by filling in the information below to
                            create your new application.
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col justify-between flex-1">
                        <div className="px-4 divide-y divide-gray-200 sm:px-6">
                          <div className="pt-6 pb-5 space-y-6">
                            <div>
                              <ReposCombobox
                                repos={repos}
                                selectedRepo={repository}
                                onSelect={(repo) => setRepository(repo)}
                              />
                            </div>
                            <div>
                              <label
                                htmlFor="description"
                                className="block text-sm font-medium text-gray-900"
                              >
                                Description
                              </label>
                              <div className="mt-1">
                                <textarea
                                  id="description"
                                  name="description"
                                  rows={4}
                                  className="block w-full border-gray-300 rounded-md shadow-sm focus:border-cyan-500 focus:ring-cyan-500 sm:text-sm"
                                  value={description}
                                  onChange={(e) =>
                                    setDestription(e.target.value)
                                  }
                                />
                              </div>
                            </div>
                            <div>
                              <RegionSelect
                                selectedRegion={region}
                                onSelect={(region) => setRegion(region)}
                              />
                            </div>
                            <div>
                              <ApplicationTypeSelect
                                selectedApplicationType={applicationType}
                                onSelect={(applicationType) =>
                                  setApplicationType(applicationType)
                                }
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end flex-shrink-0 px-4 py-4">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                        onClick={() => onClose()}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="inline-flex justify-center px-4 py-2 ml-4 text-sm font-medium text-white border border-transparent rounded-md shadow-sm bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
