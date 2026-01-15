import { writable } from 'svelte/store';

interface SessionState {
    encryptionPassword: string | null;
}

const initialState: SessionState = {
    encryptionPassword: null
};

function createSessionStore() {
    const { subscribe, set, update } = writable<SessionState>(initialState);

    return {
        subscribe,
        setPassword: (password: string) => update((s) => ({ ...s, encryptionPassword: password })),
        clearPassword: () => update((s) => ({ ...s, encryptionPassword: null })),
        reset: () => set(initialState)
    };
}

export const session = createSessionStore();
