import { defineConfig, InputTransformerFn } from "orval";
import path from "path";

const root = path.resolve(__dirname, "..", "..");
const apiClientReactSrc = path.resolve(root, "lib", "api-client-react", "src");
const apiZodSrc = path.resolve(root, "lib", "api-zod", "src");

// Our exports make assumptions about the title of the API being "Api" (i.e. generated output is `api.ts`).
const titleTransformer: InputTransformerFn = (config) => {
  config.info ??= {};
  config.info.title = "Api";

  return config;
};

// The zod output is used by the backend for JSON request/response validation.
// Multipart upload bodies are not validated with zod (multer handles uploads),
// and generating them emits File/Blob DOM types that conflict in a backend lib.
// Strip multipart request bodies only from the zod input.
const zodTransformer: InputTransformerFn = (config) => {
  titleTransformer(config);

  const paths = (config as { paths?: Record<string, unknown> }).paths ?? {};

  for (const item of Object.values(paths) as Array<Record<string, unknown>>) {
    for (const method of ["get", "post", "put", "patch", "delete"] as const) {
      const operation = item[method] as { requestBody?: { content?: Record<string, unknown> } } | undefined;
      const content = operation?.requestBody?.content;

      if (content && "multipart/form-data" in content) {
        delete operation.requestBody;
      }
    }
  }

  return config;
};

export default defineConfig({
  "api-client-react": {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: titleTransformer,
      },
    },
    output: {
      workspace: apiClientReactSrc,
      target: "generated",
      client: "react-query",
      mode: "tags-split",
      baseUrl: "/api",
      clean: true,
      prettier: true,
      override: {
        fetch: {
          includeHttpResponseReturnType: false,
        },
        mutator: {
          path: path.resolve(apiClientReactSrc, "custom-fetch.ts"),
          name: "customFetch",
        },
      },
    },
  },
  zod: {
    input: {
      target: "./openapi.yaml",
      override: {
        transformer: zodTransformer,
      },
    },
    output: {
      workspace: apiZodSrc,
      client: "zod",
      target: "generated",
      schemas: { path: "generated/types", type: "typescript" },
      mode: "tags-split",
      clean: true,
      prettier: true,
      override: {
        zod: {
          version: 3,
          coerce: {
            query: ['boolean', 'number', 'string', 'date'],
            param: ['boolean', 'number', 'string'],
            body: ['bigint', 'date'],
            response: ['bigint', 'date'],
          },
        },
        useDates: true,
        useBigInt: true,
      },
    },
  },
});
