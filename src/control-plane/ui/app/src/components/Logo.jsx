import * as React from "react";
import image from "../images/notlify-logo-rectangle.png";
export function Logo(props) {
  return (
    <div className="flex items-center px-2 lg:px-0 xl:w-64">
      <div className="flex-shrink-0">
        <img className="h-12 w-36" src={image} alt="Notlify" />
      </div>
    </div>
  );
}
