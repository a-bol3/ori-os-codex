'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  UserPlus,
  Building2,
  DollarSign,
  Mail,
  Workflow,
  Target,
  FileText,
  X,
  Sparkles,
} from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'
import { useContacts } from '@/hooks/use-contacts'
import { useDeals } from '@/hooks/use-deals'
import { toast } from 'sonner'

interface QuickActionModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const quickActions = [
  { id: 'contact', label: 'Add Contact', icon: UserPlus, color: 'text-blue-500' },
  { id: 'company', label: 'Add Company', icon: Building2, color: 'text-green-500' },
  { id: 'deal', label: 'Create Deal', icon: DollarSign, color: 'text-vivid-tangerine' },
  { id: 'campaign', label: 'New Campaign', icon: Mail, color: 'text-purple-500' },
  { id: 'workflow', label: 'Build Workflow', icon: Workflow, color: 'text-cyan-500' },
  { id: 'task', label: 'Create Task', icon: Target, color: 'text-yellow-500' },
  { id: 'note', label: 'Quick Note', icon: FileText, color: 'text-pink-500' },
]

export function QuickActionModal({ open, onOpenChange }: QuickActionModalProps) {
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { setCurrentView } = useAppStore()
  const { createContact } = useContacts({})
  const { createDeal } = useDeals({})

  // Form states
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    title: '',
    status: 'lead',
  })

  const [dealForm, setDealForm] = useState({
    name: '',
    value: '',
    stage: 'discovery',
  })

  const [taskForm, setTaskForm] = useState({
    title: '',
    priority: 'medium',
  })

  const handleActionClick = (actionId: string) => {
    if (['company', 'campaign', 'workflow', 'note'].includes(actionId)) {
      // Navigate to the appropriate module
      onOpenChange(false)
      switch (actionId) {
        case 'company':
          setCurrentView('crm')
          break
        case 'campaign':
          setCurrentView('engagement')
          break
        case 'workflow':
          setCurrentView('automation')
          break
        case 'note':
          setCurrentView('tasks')
          break
      }
      return
    }
    setSelectedAction(actionId)
  }

  const handleBack = () => {
    setSelectedAction(null)
    // Reset forms
    setContactForm({ firstName: '', lastName: '', email: '', title: '', status: 'lead' })
    setDealForm({ name: '', value: '', stage: 'discovery' })
    setTaskForm({ title: '', priority: 'medium' })
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (selectedAction === 'contact') {
        if (!contactForm.firstName || !contactForm.email) {
          toast.error('Please fill in required fields')
          setLoading(false)
          return
        }
        const success = await createContact({
          firstName: contactForm.firstName,
          lastName: contactForm.lastName,
          email: contactForm.email,
          title: contactForm.title,
          status: contactForm.status,
        })
        if (success) {
          toast.success('Contact created successfully!')
          onOpenChange(false)
          handleBack()
        } else {
          toast.error('Failed to create contact')
        }
      } else if (selectedAction === 'deal') {
        if (!dealForm.name) {
          toast.error('Please enter a deal name')
          setLoading(false)
          return
        }
        const success = await createDeal({
          name: dealForm.name,
          value: dealForm.value ? parseFloat(dealForm.value) : null,
          stage: dealForm.stage,
          status: 'open',
        })
        if (success) {
          toast.success('Deal created successfully!')
          onOpenChange(false)
          handleBack()
        } else {
          toast.error('Failed to create deal')
        }
      } else if (selectedAction === 'task') {
        if (!taskForm.title) {
          toast.error('Please enter a task title')
          setLoading(false)
          return
        }
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: taskForm.title,
            priority: taskForm.priority,
          }),
        })
        const result = await response.json()
        if (result.success) {
          toast.success('Task created successfully!')
          onOpenChange(false)
          handleBack()
        } else {
          toast.error('Failed to create task')
        }
      }
    } catch (error) {
      console.error('Submit error:', error)
      toast.error('Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-vivid-tangerine" />
            {selectedAction ? quickActions.find(a => a.id === selectedAction)?.label : 'Quick Action'}
          </DialogTitle>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {!selectedAction ? (
            <motion.div
              key="actions"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-2 gap-3 py-4"
            >
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  className="h-20 flex flex-col gap-2 justify-center items-center hover:bg-muted transition-colors"
                  onClick={() => handleActionClick(action.id)}
                >
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                  <span className="text-sm">{action.label}</span>
                </Button>
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4 py-4"
            >
              <Button variant="ghost" size="sm" onClick={handleBack} className="mb-2">
                ← Back to actions
              </Button>

              {selectedAction === 'contact' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        value={contactForm.firstName}
                        onChange={(e) => setContactForm({ ...contactForm, firstName: e.target.value })}
                        placeholder="John"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={contactForm.lastName}
                        onChange={(e) => setContactForm({ ...contactForm, lastName: e.target.value })}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="john@company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      value={contactForm.title}
                      onChange={(e) => setContactForm({ ...contactForm, title: e.target.value })}
                      placeholder="CEO, Manager, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={contactForm.status}
                      onValueChange={(value) => setContactForm({ ...contactForm, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospect">Prospect</SelectItem>
                        <SelectItem value="qualified">Qualified</SelectItem>
                        <SelectItem value="customer">Customer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedAction === 'deal' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="dealName">Deal Name *</Label>
                    <Input
                      id="dealName"
                      value={dealForm.name}
                      onChange={(e) => setDealForm({ ...dealForm, name: e.target.value })}
                      placeholder="Enterprise Plan - Acme Corp"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dealValue">Value ($)</Label>
                    <Input
                      id="dealValue"
                      type="number"
                      value={dealForm.value}
                      onChange={(e) => setDealForm({ ...dealForm, value: e.target.value })}
                      placeholder="50000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stage">Stage</Label>
                    <Select
                      value={dealForm.stage}
                      onValueChange={(value) => setDealForm({ ...dealForm, stage: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discovery">Discovery</SelectItem>
                        <SelectItem value="qualification">Qualification</SelectItem>
                        <SelectItem value="proposal">Proposal</SelectItem>
                        <SelectItem value="negotiation">Negotiation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {selectedAction === 'task' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskTitle">Task Title *</Label>
                    <Input
                      id="taskTitle"
                      value={taskForm.title}
                      onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                      placeholder="Follow up with client"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={taskForm.priority}
                      onValueChange={(value) => setTaskForm({ ...taskForm, priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={handleBack}>
                  Cancel
                </Button>
                <Button
                  className="bg-vivid-tangerine hover:bg-tangerine-dark"
                  onClick={handleSubmit}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Create'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
