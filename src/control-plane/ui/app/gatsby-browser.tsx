import "./src/styles/global.css";
import "./src/styles/global.css";

import React from "react";
import RootElement from "./src/components/RootElement";

export const wrapRootElement = ({ element }) => {
  return <RootElement>{element}</RootElement>;
};
