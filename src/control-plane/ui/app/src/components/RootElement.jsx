import * as React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";

const queryClient = new QueryClient();

const RootElement = ({ children }) => {
  return (
    <Auth0Provider
      domain="dev-6pd0gm26.auth0.com"
      clientId="WJ5WXNz5rMIqzHV60ylD1nZPlVgx8trW"
      authorizationParams={{
        redirect_uri:
          typeof window !== "undefined"
            ? `${window.location.origin}/dashboard/`
            : "http://localhost:8000/dashboard/",
      }}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </Auth0Provider>
  );
};

export default RootElement;
