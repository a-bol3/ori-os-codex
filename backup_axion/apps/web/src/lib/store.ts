import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Marketing Page State
type MarketingPage = 
  | 'home' 
  | 'intelligence' 
  | 'crm' 
  | 'automation' 
  | 'engagement' 
  | 'analytics' 
  | 'content'
  | 'seo-studio'
  | 'pricing' 
  | 'about' 
  | 'features'
  | 'integrations'
  | 'changelog'
  | 'roadmap'
  | 'blog'
  | 'careers'
  | 'press'
  | 'contact'
  | 'docs'
  | 'api'
  | 'help'
  | 'community'
  | 'status'
  | 'demo'
  // Legal pages
  | 'privacy' 
  | 'gdpr' 
  | 'security' 
  | 'cookies' 
  | 'terms'

// App View State
type AppView = 'marketing' | 'dashboard' | 'intelligence' | 'crm' | 'automation' | 'engagement' | 'compliance' | 'tasks' | 'settings' | 'seo'

interface AppState {
  currentView: AppView
  marketingPage: MarketingPage
  sidebarCollapsed: boolean
  theme: 'light' | 'dark'
  setCurrentView: (view: AppView) => void
  setMarketingPage: (page: MarketingPage) => void
  toggleSidebar: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      currentView: 'marketing',
      marketingPage: 'home',
      sidebarCollapsed: false,
      theme: 'dark',
      setCurrentView: (view) => set({ currentView: view }),
      setMarketingPage: (page) => set({ marketingPage: page, currentView: 'marketing' }),
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ori-os-storage',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed, theme: state.theme, currentView: state.currentView, marketingPage: state.marketingPage }),
    }
  )
)

// CRM State
interface CRMState {
  selectedContactId: string | null
  selectedCompanyId: string | null
  selectedDealId: string | null
  setSelectedContact: (id: string | null) => void
  setSelectedCompany: (id: string | null) => void
  setSelectedDeal: (id: string | null) => void
}

export const useCRMStore = create<CRMState>((set) => ({
  selectedContactId: null,
  selectedCompanyId: null,
  selectedDealId: null,
  setSelectedContact: (id) => set({ selectedContactId: id }),
  setSelectedCompany: (id) => set({ selectedCompanyId: id }),
  setSelectedDeal: (id) => set({ selectedDealId: id }),
}))

// Automation State
interface AutomationState {
  selectedWorkflowId: string | null
  isEditing: boolean
  setSelectedWorkflow: (id: string | null) => void
  setIsEditing: (editing: boolean) => void
}

export const useAutomationStore = create<AutomationState>((set) => ({
  selectedWorkflowId: null,
  isEditing: false,
  setSelectedWorkflow: (id) => set({ selectedWorkflowId: id }),
  setIsEditing: (editing) => set({ isEditing: editing }),
}))

// Knowledge State
interface KnowledgeState {
  selectedPageId: string | null
  searchQuery: string
  setSelectedPage: (id: string | null) => void
  setSearchQuery: (query: string) => void
}

export const useKnowledgeStore = create<KnowledgeState>((set) => ({
  selectedPageId: null,
  searchQuery: '',
  setSelectedPage: (id) => set({ selectedPageId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))
