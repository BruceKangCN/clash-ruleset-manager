import { svelteTesting } from "@testing-library/svelte/vite";

export default [
    {
        extends: "./vite.config.ts",
        plugins: [svelteTesting()],
        test: {
            name: "lib",
            environment: "node",
            include: ["src/**/*.{test,spec}.{js,ts}"],
            exclude: ["src/**/*.svelte.{test,spec}.{js,ts}"],
        },
    },
];
