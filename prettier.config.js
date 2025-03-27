export default {
    plugins: ["prettier-plugin-svelte"],
    overrides: [
        { files: "*.svelte", options: { parser: "svelte" } },
    ],
    tabWidth: 4,
}
