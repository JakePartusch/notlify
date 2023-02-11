import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Auth0Provider } from "@auth0/auth0-react";

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <Auth0Provider
      domain="dev-6pd0gm26.auth0.com"
      clientId="WJ5WXNz5rMIqzHV60ylD1nZPlVgx8trW"
      authorizationParams={{
        redirect_uri: "http://localhost:3000",
      }}
    >
      <QueryClientProvider client={queryClient}>
        <Component {...pageProps} />
      </QueryClientProvider>
    </Auth0Provider>
  );
}
