import React, { ReactElement } from "react";
import RootElement from "./src/components/RootElement";

export const wrapRootElement = ({ element }: { element: ReactElement }) => {
  return <RootElement>{element}</RootElement>;
};
