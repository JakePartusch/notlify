import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/control-plane/schema.graphql",
  documents: ["src/control-plane/ui/app/**/*.tsx"],
  generates: {
    "src/control-plane/generated/graphql.types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        scalars: {
          DateTime: "string",
        },
      },
    },
    "src/control-plane/ui/app/gql/": {
      preset: "client",
      plugins: [],
    },
  },
};

export default config;
