import * as React from "react";
import { Link } from "gatsby";

export function NavLink({ href, children }) {
  return (
    <Link
      to={href}
      className="inline-block px-2 py-1 text-sm rounded-lg text-slate-700 hover:bg-slate-100 hover:text-slate-900"
    >
      {children}
    </Link>
  );
}
