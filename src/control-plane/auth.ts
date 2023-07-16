import { APIGatewayProxyEvent } from "aws-lambda";
import fetch, { Headers } from "node-fetch";
import jwt from "jsonwebtoken";
import { Config } from "sst/node/config";
import { trace } from "@opentelemetry/api";

export const handler = async (event: APIGatewayProxyEvent) => {
  console.log(JSON.stringify(event, null, 2));
  const tracer = trace
    .getTracer(process.env.OTEL_SERVICE_NAME!)
    .startSpan("api-handler", { root: false });
  const code = event.queryStringParameters?.code;

  const headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append("Content-Type", "application/json");

  const raw = JSON.stringify({
    client_id: "30ccac4ed61bccc390fe",
    client_secret: Config.GITHUB_OAUTH_SECRET,
    code,
    redirect_uri:
      "https://vt2t2uctaf.execute-api.us-east-1.amazonaws.com/github/callback",
  });

  const requestOptions = {
    method: "POST",
    headers,
    body: raw,
  };

  const response = await fetch(
    "https://github.com/login/oauth/access_token",
    requestOptions
  );
  const gitHubToken = ((await response.json()) as any).access_token;
  const { login, avatar_url, name, company }: any = await getUser(gitHubToken);
  const token = jwt.sign(
    { login, avatar_url, name, company },
    Config.JWT_SECRET_KEY,
    {
      algorithm: "RS256",
      expiresIn: "1h",
    }
  );
  console.log(token);
  if (tracer) {
    tracer.end();
  }
  return {
    statusCode: 302,
    headers: {
      Location: `https://notlify.dev/callback?token=${token}`,
    },
  };
};

const getUser = async (token: string) => {
  const headers = new Headers();
  headers.append("Accept", "application/json");
  headers.append("Authorization", `Bearer ${token}`);
  headers.append("X-GitHub-Api-Version", "2022-11-28");

  const requestOptions = {
    method: "GET",
    headers,
  };
  const response = await fetch("https://api.github.com/user", requestOptions);
  const user = await response.json();
  return user;
};
