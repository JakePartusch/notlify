import "./src/styles/global.css";

import RootElement from "./src/components/RootElement";

export const wrapRootElement = ({ element }) => {
  return <RootElement>{element}</RootElement>;
};
