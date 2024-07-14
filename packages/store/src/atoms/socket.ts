import { atom } from "recoil";

export const socketState = atom<WebSocket | null>({
    key: 'socket',
    default: null,
})