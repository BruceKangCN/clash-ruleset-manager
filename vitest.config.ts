import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
    plugins: [sveltekit()],
    test: {
        environment: "node",
        setupFiles: ["vitest-setup.ts"],
        include: ["src/lib/**/*.{test,spec}.{js,ts}"],
        coverage: {
            reporter: ["text", "json", "html", "lcov"],
            include: ["src/lib/**/*.{js,ts}"],
            exclude: [
                "src/**/*.d.ts",

                // set/get context can only be used inside component
                "src/lib/toast.ts",
            ],
        },

        // to handle url-toolkit imports
        //     depended by `@bruce/rest-client`
        //     depended by `NodeClient` and `RuleSetClient` in `src/lib/api.ts`
        server: {
            deps: {
                inline: [
                    /\/node_modules\/@bruce\/rest-client/,
                ],
            },
        },
    },
});
