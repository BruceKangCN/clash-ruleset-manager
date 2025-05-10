import { getContext, setContext } from "svelte";

/*!
 * toast module
 *
 * including type-safe wrappers for toast context:
 * - getter/setter for toast context
 * - type definition for toast types
 * - type definition for `CreateToast`
 */

const key = "create-toast";

export type ToastType = "success" | "info" | "warn" | "error";

export type CreateToast = (type: ToastType, msg: string) => void;

export function getToastContext(): CreateToast {
    return getContext(key);
}

export function setToastContext(value: CreateToast) {
    setContext(key, value);
}
