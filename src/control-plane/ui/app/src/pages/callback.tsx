import { HeadFC } from "gatsby";
import React, { useEffect } from "react";
import { useLocalStorage } from "react-use";

const CallbackPage = ({ location }) => {
  const [_, setToken] = useLocalStorage("notlify:token");
  console.log(location); // inspect location for yourself

  // the parameter to return for URL. Example:
  // https://localhost:8000/?parameter1=firstParam&parameter2=secondParam
  const params = new URLSearchParams(location.search);
  const token = params.get("token");

  useEffect(() => {
    setToken(token);
    window.location.href = "/dashboard";
  }, [token]);
  return <></>;
};

export default CallbackPage;

export const Head: HeadFC = () => <title>Notlify — Dashboard</title>;
