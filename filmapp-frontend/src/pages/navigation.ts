
type NavigateFn = (to: string, opts?: { replace?: boolean }) => void;

let _navigate: NavigateFn | null = null;

export function setNavigate(fn: NavigateFn) {
    _navigate = fn;
}

export function go(to: string) {
    _navigate?.(to, { replace: true });
}
