import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ConfigState {
  AUTO_SHOW_ADVANCED: boolean
  AUTO_EXPAND_MESSAGES: boolean
  setAutoShowAdvanced: (value: boolean) => void
  setAutoExpandMessages: (value: boolean) => void
}

const defaultSettings = {
  AUTO_SHOW_ADVANCED: false,
  AUTO_EXPAND_MESSAGES: false
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      ...defaultSettings,
      setAutoShowAdvanced: (value) => set({ AUTO_SHOW_ADVANCED: value }),
      setAutoExpandMessages: (value) => set({ AUTO_EXPAND_MESSAGES: value }),
    }),
    {
      name: 'agent_config_settings',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
