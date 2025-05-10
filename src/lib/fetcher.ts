type Params = Parameters<typeof fetch>;
type Input = Params[0];
type Options = Omit<NonNullable<Params[1]>, "method" | "body">;

/**
 * an OOP wrapper for Fetch API
 */
export class Fetcher {
    #fetch: typeof fetch;

    constructor(f: typeof fetch) {
        this.#fetch = f;
    }

    static wrap(f: typeof fetch) {
        return new Fetcher(f);
    }

    async get<T>(input: Input, options?: Options): Promise<T> {
        // GET request cannot have a request body, so `data` is `undefined`
        const init = this.json("GET", undefined, options);
        return await this.send(input, init);
    }

    async head(input: Input, options?: Options): Promise<Headers> {
        // HEAD request cannot have a request body, so `data` is `undefined`
        const init = this.json("HEAD", undefined, options);

        // HEAD response only contains headers, return it directly withod parse
        const { headers } = await this.#fetch(input, init);
        return headers;
    }

    async options(input: Input, options?: Options): Promise<string[]> {
        // options request cannot have a request body, so `data` is `undefined`
        const init = this.json("OPTIONS", undefined, options);

        // options response only contains headers
        const { headers } = await this.#fetch(input, init);

        // and only `Allow` is needed
        const allow = headers.get("Allow") ?? "";

        // convert comma seprated list to array of string
        return allow.split(",").map((s) => s.trim());
    }

    async post<T, D>(input: Input, data?: D, options?: Options): Promise<T> {
        const init = this.json("POST", data, options);
        return await this.send(input, init);
    }

    async put<T, D>(input: Input, data?: D, options?: Options): Promise<T> {
        const init = this.json("PUT", data, options);
        return await this.send(input, init);
    }

    async patch<T, D>(input: Input, data?: D, options?: Options): Promise<T> {
        const init = this.json("PATCH", data, options);
        return await this.send(input, init);
    }

    async delete<T, D>(input: Input, data?: D, options?: Options): Promise<T> {
        const init = this.json("DELETE", data, options);
        return await this.send(input, init);
    }

    /**
     * construct a `RequestInit` with the given `method` and `data`.
     * @param method HTTP method
     * @param data JSON request body
     */
    json<T>(method: string, data?: T, options?: Options): RequestInit {
        return {
            ...options,
            method,
            body: JSON.stringify(data),
        };
    }

    /**
     * send request, return JSON parsed response.
     */
    async send<T>(input: Input, init: RequestInit): Promise<T> {
        const resp = await this.#fetch(input, init);
        return await resp.json();
    }
}

export const fetcher = Fetcher.wrap(fetch);
