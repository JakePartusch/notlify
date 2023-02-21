import * as React from "react";
import { HeadFC, Link, PageProps } from "gatsby";

const DashboardPage: React.FC<PageProps> = () => {
  return <main>Dashboard</main>;
};

export default DashboardPage;

export const Head: HeadFC = () => <title>Home Page</title>;
