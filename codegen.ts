import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/control-plane/schema.graphql",
  generates: {
    "src/control-plane/generated/graphql.types.ts": {
      plugins: ["typescript", "typescript-resolvers"],
      config: {
        scalars: {
          DateTime: "string",
        },
      },
    },
  },
};

export default config;
