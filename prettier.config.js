/** @type {import("prettier").Config} */
const config = {
    plugins: ["prettier-plugin-svelte"],
    overrides: [{ files: "*.svelte", options: { parser: "svelte" } }],
    tabWidth: 4,
};

export default config;
