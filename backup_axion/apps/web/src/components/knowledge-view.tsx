'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Search,
  Plus,
  MoreHorizontal,
  ChevronRight,
  FolderOpen,
  File,
  Database as DatabaseIcon,
  Calendar,
  Columns3,
  List,
  LayoutGrid,
  Table2,
  Clock,
  Star,
  Trash2,
  Edit,
  Copy,
  Share2,
  Lock,
  Globe,
  ChevronDown,
  Check,
  Sparkles,
  Type,
  Italic,
  Underline as UnderlineIcon,
  ListChecks,
  ListOrdered,
  Code,
  Quote,
  Heading,
  Heading2,
  Image as ImageIcon,
  Link2,
  X,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from 'sonner'
import {
  usePageTree,
  usePage,
  useBlocks,
  useDatabases,
  type WorkspacePage,
  type Block,
  type KnowledgeDatabase,
} from '@/hooks/use-knowledge'

// Toolbar items
const toolbarItems = [
  { icon: Type, tooltip: 'Bold', shortcut: '⌘B' },
  { icon: Italic, tooltip: 'Italic', shortcut: '⌘I' },
  { icon: UnderlineIcon, tooltip: 'Underline', shortcut: '⌘U' },
  { icon: Heading, tooltip: 'Heading 1', shortcut: '⌘1' },
  { icon: Heading2, tooltip: 'Heading 2', shortcut: '⌘2' },
  { icon: List, tooltip: 'Bullet List', shortcut: '⌘⇧8' },
  { icon: ListOrdered, tooltip: 'Numbered List', shortcut: '⌘⇧7' },
  { icon: Quote, tooltip: 'Quote', shortcut: '⌘⇧9' },
  { icon: Code, tooltip: 'Code', shortcut: '⌘E' },
  { icon: Link2, tooltip: 'Link', shortcut: '⌘K' },
  { icon: ImageIcon, tooltip: 'Image', shortcut: '' },
]

// Page Modal
function PageModal({
  open,
  onOpenChange,
  parentId,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  parentId?: string | null
  onSave: (data: { title: string; icon: string; parentId?: string | null }) => Promise<{ success: boolean; error?: string }>
}) {
  const [title, setTitle] = useState('')
  const [icon, setIcon] = useState('📄')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Page title is required')
      return
    }

    setLoading(true)
    const result = await onSave({ title, icon, parentId })
    setLoading(false)

    if (result.success) {
      toast.success('Page created')
      onOpenChange(false)
      setTitle('')
      setIcon('📄')
    } else {
      toast.error(result.error || 'Failed to create page')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Page</DialogTitle>
          <DialogDescription>Create a new page in your workspace</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-2xl px-3" onClick={() => setIcon(icon === '📄' ? '📁' : '📄')}>
              {icon}
            </Button>
            <Input
              placeholder="Untitled"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Database Modal
function DatabaseModal({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (data: { name: string; description?: string; icon: string }) => Promise<{ success: boolean; error?: string }>
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('📊')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Database name is required')
      return
    }

    setLoading(true)
    const result = await onSave({ name, description: description || undefined, icon })
    setLoading(false)

    if (result.success) {
      toast.success('Database created')
      onOpenChange(false)
      setName('')
      setDescription('')
      setIcon('📊')
    } else {
      toast.error(result.error || 'Failed to create database')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Database</DialogTitle>
          <DialogDescription>Create a new database to organize your data</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="outline" className="text-2xl px-3" onClick={() => setIcon(icon === '📊' ? '✅' : '📊')}>
              {icon}
            </Button>
            <Input
              placeholder="Database name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="flex-1"
            />
          </div>
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              placeholder="What is this database for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading} className="bg-vivid-tangerine hover:bg-tangerine-dark">
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Block Renderer
function BlockRenderer({
  block,
  onUpdate,
}: {
  block: Block
  onUpdate: (content: any) => void
}) {
  const renderBlock = () => {
    switch (block.type) {
      case 'heading1':
        return (
          <h1 className="text-3xl font-bold" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || 'Heading 1'}
          </h1>
        )
      case 'heading2':
        return (
          <h2 className="text-2xl font-semibold" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || 'Heading 2'}
          </h2>
        )
      case 'heading3':
        return (
          <h3 className="text-xl font-semibold" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || 'Heading 3'}
          </h3>
        )
      case 'text':
        return (
          <p className="text-foreground" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || 'Type something...'}
          </p>
        )
      case 'todo':
        const checked = block.properties?.checked || false
        return (
          <div className="flex items-center gap-3">
            <div
              onClick={() => onUpdate({ ...block.properties, checked: !checked })}
              className={`h-4 w-4 border cursor-pointer ${
                checked
                  ? 'bg-vivid-tangerine border-vivid-tangerine'
                  : 'border-muted-foreground'
              } flex items-center justify-center`}
            >
              {checked && <Check className="h-3 w-3 text-white" />}
            </div>
            <span
              className={`${checked ? 'text-muted-foreground line-through' : ''}`}
              contentEditable
              suppressContentEditableWarning
              onBlur={(e) => onUpdate({ ...block.properties, text: e.currentTarget.textContent })}
            >
              {block.content || 'To-do item'}
            </span>
          </div>
        )
      case 'bulleted_list':
        return (
          <div className="flex items-start gap-2">
            <span className="mt-2 h-1.5 w-1.5 bg-foreground" />
            <p className="flex-1" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
              {block.content || 'List item'}
            </p>
          </div>
        )
      case 'numbered_list':
        return (
          <div className="flex items-start gap-2">
            <span className="text-muted-foreground">•</span>
            <p className="flex-1" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
              {block.content || 'List item'}
            </p>
          </div>
        )
      case 'quote':
        return (
          <blockquote className="border-l-4 border-muted-foreground pl-4 italic text-muted-foreground" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || 'Quote'}
          </blockquote>
        )
      case 'callout':
        return (
          <div className="flex items-start gap-3 bg-muted p-4">
            <span>{block.properties?.icon || '💡'}</span>
            <p className="flex-1" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
              {block.content || 'Callout text'}
            </p>
          </div>
        )
      case 'code':
        return (
          <pre className="bg-muted p-4 text-sm font-mono overflow-x-auto" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || '// Code block'}
          </pre>
        )
      case 'divider':
        return <hr className="border-border my-4" />
      default:
        return (
          <p className="text-muted-foreground" contentEditable suppressContentEditableWarning onBlur={(e) => onUpdate(e.currentTarget.textContent)}>
            {block.content || 'Block'}
          </p>
        )
    }
  }

  return (
    <div className="group relative hover:bg-muted/50 px-2 py-1 -mx-2">
      {renderBlock()}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 opacity-0 group-hover:opacity-100 h-6 w-6"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

// Page Tree Item
function PageTreeItem({
  page,
  selectedId,
  onSelect,
  onToggle,
  expandedFolders,
  onCreateChild,
  onDelete,
  level = 0,
}: {
  page: WorkspacePage
  selectedId: string | null
  onSelect: (id: string) => void
  onToggle: (id: string) => void
  expandedFolders: string[]
  onCreateChild: (parentId: string) => void
  onDelete: (id: string) => void
  level?: number
}) {
  const hasChildren = page.children && page.children.length > 0
  const isExpanded = expandedFolders.includes(page.id)
  const isSelected = selectedId === page.id

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted cursor-pointer group ${
          isSelected ? 'bg-muted' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren ? (
          <button onClick={() => onToggle(page.id)} className="p-0">
            <ChevronDown
              className={`h-3 w-3 transition-transform ${isExpanded ? '' : '-rotate-90'}`}
            />
          </button>
        ) : (
          <span className="w-3" />
        )}
        <span onClick={() => onSelect(page.id)} className="flex items-center gap-2 flex-1 truncate">
          <span>{page.icon || '📄'}</span>
          <span className="truncate">{page.title}</span>
        </span>
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5"
            onClick={(e) => {
              e.stopPropagation()
              onCreateChild(page.id)
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="mr-2 h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onClick={() => onDelete(page.id)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div className="border-l border-border ml-4">
          {page.children!.map((child) => (
            <PageTreeItem
              key={child.id}
              page={child}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggle={onToggle}
              expandedFolders={expandedFolders}
              onCreateChild={onCreateChild}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function KnowledgeView() {
  const [selectedPageId, setSelectedPageId] = useState<string | null>(null)
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [pageModalOpen, setPageModalOpen] = useState(false)
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false)
  const [newPageParentId, setNewPageParentId] = useState<string | null>(null)

  // Hooks
  const { pageTree, loading: pagesLoading, refetch: refetchPages, createPage } = usePageTree()
  const { page, loading: pageLoading, refetch: refetchPage, updatePage, deletePage } = usePage(selectedPageId)
  const { blocks, loading: blocksLoading, createBlock, setBlocks } = useBlocks(selectedPageId)
  const { databases, loading: databasesLoading, refetch: refetchDatabases, createDatabase } = useDatabases()

  const isLoading = pagesLoading || pageLoading || blocksLoading || databasesLoading

  const toggleFolder = (id: string) => {
    setExpandedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    )
  }

  const handleCreatePage = async (data: { title: string; icon: string; parentId?: string | null }) => {
    const result = await createPage({ title: data.title, icon: data.icon, parentId: data.parentId || null })
    if (result.success && data.parentId) {
      setExpandedFolders(prev => [...prev, data.parentId!])
    }
    return result
  }

  const handleCreateChildPage = (parentId: string) => {
    setNewPageParentId(parentId)
    setPageModalOpen(true)
  }

  const handleDeletePage = async (id: string) => {
    if (confirm('Delete this page? It will be moved to trash.')) {
      const result = await deletePage()
      if (result.success) {
        toast.success('Page moved to trash')
        refetchPages()
        if (selectedPageId === id) {
          setSelectedPageId(null)
        }
      }
    }
  }

  const handleAddBlock = async (type: string) => {
    await createBlock({ type })
  }

  const handleCreateDatabase = async (data: { name: string; description?: string; icon: string }) => {
    const result = await createDatabase(data)
    if (result.success) {
      refetchDatabases()
    }
    return result
  }

  const refreshAll = () => {
    refetchPages()
    refetchPage()
    refetchDatabases()
    toast.success('Data refreshed')
  }

  // Filter pages by search
  const filteredPageTree = searchQuery
    ? pageTree.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()))
    : pageTree

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-muted/30 flex flex-col">
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-3 space-y-1">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <Clock className="h-4 w-4" />
            Recent
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <Star className="h-4 w-4" />
            Favorites
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" />
            Trash
          </Button>
        </div>

        {/* Page Tree */}
        <ScrollArea className="flex-1">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Pages
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => {
                  setNewPageParentId(null)
                  setPageModalOpen(true)
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {pagesLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : filteredPageTree.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No pages yet</p>
            ) : (
              <div className="space-y-1">
                {filteredPageTree.map((page) => (
                  <PageTreeItem
                    key={page.id}
                    page={page}
                    selectedId={selectedPageId}
                    onSelect={setSelectedPageId}
                    onToggle={toggleFolder}
                    expandedFolders={expandedFolders}
                    onCreateChild={handleCreateChildPage}
                    onDelete={handleDeletePage}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* New Page Button */}
        <div className="p-3 border-t border-border">
          <Button
            className="w-full bg-vivid-tangerine hover:bg-tangerine-dark"
            onClick={() => {
              setNewPageParentId(null)
              setPageModalOpen(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Page
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b border-border p-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <TooltipProvider>
              {toolbarItems.map((item, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <item.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {item.tooltip} {item.shortcut && <span className="text-muted-foreground">({item.shortcut})</span>}
                  </TooltipContent>
                </Tooltip>
              ))}
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={refreshAll} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Assist
            </Button>
            <Button variant="ghost" size="sm" className="gap-2">
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>
                  <Edit className="mr-2 h-4 w-4" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="mr-2 h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Star className="mr-2 h-4 w-4" />
                  Add to Favorites
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Lock className="mr-2 h-4 w-4" />
                  Lock Page
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-500" onClick={() => selectedPageId && handleDeletePage(selectedPageId)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <ScrollArea className="flex-1">
          <div className="max-w-4xl mx-auto p-8">
            {pageLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : selectedPageId && page ? (
              <>
                {/* Page Title */}
                <div className="mb-8">
                  <div className="text-6xl mb-4 cursor-pointer" onClick={() => {
                    const newIcon = prompt('Enter emoji icon:', page.icon || '📄')
                    if (newIcon) updatePage({ icon: newIcon })
                  }}>
                    {page.icon || '📄'}
                  </div>
                  <h1
                    className="text-4xl font-bold mb-2 outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) => {
                      const newTitle = e.currentTarget.textContent || 'Untitled'
                      updatePage({ title: newTitle })
                    }}
                  >
                    {page.title}
                  </h1>
                  <p className="text-muted-foreground">
                    {page.type === 'database' ? 'Database' : 'Page'} • Last edited {new Date(page.updatedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Blocks */}
                <div className="space-y-4">
                  {blocks.map((block) => (
                    <BlockRenderer
                      key={block.id}
                      block={block}
                      onUpdate={(content) => {
                        // Update block content (would need API endpoint)
                        setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, content } : b))
                      }}
                    />
                  ))}

                  {/* Add Block Button */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground py-2">
                        <Plus className="h-4 w-4" />
                        <span className="text-sm">Add a block</span>
                        <span className="text-xs text-muted-foreground">Type / for commands</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => handleAddBlock('text')}>
                        <Type className="mr-2 h-4 w-4" />
                        Text
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('heading1')}>
                        <Heading className="mr-2 h-4 w-4" />
                        Heading 1
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('heading2')}>
                        <Heading2 className="mr-2 h-4 w-4" />
                        Heading 2
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('todo')}>
                        <ListChecks className="mr-2 h-4 w-4" />
                        To-do
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('bulleted_list')}>
                        <List className="mr-2 h-4 w-4" />
                        Bullet List
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('numbered_list')}>
                        <ListOrdered className="mr-2 h-4 w-4" />
                        Numbered List
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('quote')}>
                        <Quote className="mr-2 h-4 w-4" />
                        Quote
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('code')}>
                        <Code className="mr-2 h-4 w-4" />
                        Code
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('callout')}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Callout
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleAddBlock('divider')}>
                        <div className="w-4 h-0.5 bg-muted-foreground mr-2" />
                        Divider
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="text-center py-12">
                <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold mb-2">Select a page</h2>
                <p className="text-muted-foreground mb-6">
                  Choose a page from the sidebar or create a new one
                </p>
                <Button
                  onClick={() => {
                    setNewPageParentId(null)
                    setPageModalOpen(true)
                  }}
                  className="bg-vivid-tangerine hover:bg-tangerine-dark"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Page
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Sidebar - Databases */}
      <div className="w-64 border-l border-border bg-muted/30 hidden lg:block">
        <div className="p-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Databases
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setDatabaseModalOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {databasesLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : databases.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No databases yet</p>
          ) : (
            <div className="space-y-2">
              {databases.map((db) => (
                <button
                  key={db.id}
                  className="flex w-full items-center gap-2 px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <span>{db.icon || '📊'}</span>
                  <span className="truncate flex-1 text-left">{db.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    {db.rowCount || 0}
                  </Badge>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* View Options */}
        <div className="p-3 border-t border-border">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
            View As
          </span>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Table2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Columns3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Calendar className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ListChecks className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PageModal
        open={pageModalOpen}
        onOpenChange={(open) => {
          setPageModalOpen(open)
          if (!open) setNewPageParentId(null)
        }}
        parentId={newPageParentId}
        onSave={handleCreatePage}
      />

      <DatabaseModal
        open={databaseModalOpen}
        onOpenChange={setDatabaseModalOpen}
        onSave={handleCreateDatabase}
      />
    </div>
  )
}
