import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        pool: "threads",
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
    },
});
