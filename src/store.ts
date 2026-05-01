import { create } from 'zustand';

interface AppState {
  activeTab: 'chats' | 'updates' | 'communities' | 'calls' | 'status';
  activePanel: string | null;
  activeStory: string | null;
  isCalling: boolean;
  selectedLanguage: string;
  setTab: (tab: 'chats' | 'updates' | 'communities' | 'calls' | 'status') => void;
  setActivePanel: (panel: string | null) => void;
  setActiveStory: (story: string | null) => void;
  setIsCalling: (calling: boolean) => void;
  setLanguage: (lang: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'chats',
  activePanel: 'home',
  activeStory: null,
  isCalling: false,
  selectedLanguage: 'English',
  setTab: (tab) => set({ activeTab: tab }),
  setActivePanel: (panel) => set({ activePanel: panel }),
  setActiveStory: (story) => set({ activeStory: story }),
  setIsCalling: (calling) => set({ isCalling: calling }),
  setLanguage: (lang) => set({ selectedLanguage: lang }),
}));
