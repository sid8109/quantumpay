import { atom } from 'recoil';

interface Session {
    user: {
        id: string;
        email: string;
        name: string;
        number: string;
        balance: number;
        locked: number;
        profilePic?: string;
    }
}

export const sessionState = atom<Session | null>({
  key: 'sessionState',
  default: null,
});