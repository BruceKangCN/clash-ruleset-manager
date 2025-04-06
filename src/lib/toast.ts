import { getContext, setContext } from "svelte";

const key = "create-toast";

export type ToastType = "success" | "info" | "warn" | "error";

export type CreateToast = (type: ToastType, msg: string) => void;

export function getToastContext(): CreateToast {
    return getContext(key);
}

export function setToastContext(value: CreateToast) {
    setContext(key, value);
}
