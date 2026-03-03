'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Settings as SettingsIcon,
  User,
  Building2,
  Globe,
  Shield,
  Bell,
  CreditCard,
  Key,
  Palette,
  Clock,
  Mail,
  Loader2,
  Save,
  RefreshCw,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { useSettings } from '@/hooks/use-settings'

const timezones = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Australia/Sydney',
]

const currencies = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY']

const locales = ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt']

const industries = [
  'Technology',
  'Healthcare',
  'Finance',
  'Education',
  'Retail',
  'Manufacturing',
  'Consulting',
  'Marketing',
  'Real Estate',
  'Other',
]

const companySizes = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '501-1000',
  '1000+',
]

export function SettingsView() {
  const { organization, user, loading, error, updateSettings } = useSettings()
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Local state for form - tracks user modifications
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({})

  // Helper to get current value - use local state if modified, otherwise use store value
  const getValue = (key: string, storeValue: string | number | boolean | undefined | null, defaultValue: string | number | boolean = '') => {
    if (key in formData) {
      return formData[key]
    }
    return storeValue ?? defaultValue
  }

  // Update form data on change
  const updateFormData = (key: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [key]: value }))
  }

  // Get values from store or use defaults
  const userName = getValue('userName', user?.name, '')
  const userEmail = user?.email || ''
  const userTimezone = getValue('userTimezone', user?.timezone, 'UTC')
  const userLocale = getValue('userLocale', user?.locale, 'en')
  const userTheme = getValue('userTheme', user?.theme, 'dark')
  const orgName = getValue('orgName', organization?.name, '')
  const orgWebsite = getValue('orgWebsite', organization?.website, '')
  const orgIndustry = getValue('orgIndustry', organization?.industry, '')
  const orgSize = getValue('orgSize', organization?.size, '')
  const orgTimezone = getValue('orgTimezone', organization?.timezone, 'UTC')
  const orgCurrency = getValue('orgCurrency', organization?.currency, 'USD')
  const gdprEnabled = getValue('gdprEnabled', organization?.gdprEnabled, true)
  const gdprRetention = getValue('gdprRetention', organization?.gdprDefaultRetention, 30)
  const gdprEmail = getValue('gdprEmail', organization?.gdprContactEmail, '')

  const handleSave = async () => {
    setSaving(true)
    const result = await updateSettings({
      user: {
        name: userName as string,
        timezone: userTimezone as string,
        locale: userLocale as string,
        theme: userTheme as string,
      },
      organization: {
        name: orgName as string,
        website: orgWebsite as string,
        industry: orgIndustry as string,
        size: orgSize as string,
        timezone: orgTimezone as string,
        currency: orgCurrency as string,
        gdprEnabled: gdprEnabled as boolean,
        gdprDefaultRetention: gdprRetention as number,
        gdprContactEmail: gdprEmail as string,
      },
    })
    setSaving(false)

    if (result.success) {
      toast.success('Settings saved successfully')
      // Clear local modifications after save
      setFormData({})
    } else {
      toast.error('Failed to save settings')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and organization settings</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-vivid-tangerine hover:bg-tangerine-dark">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">
            <User className="mr-2 h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="organization">
            <Building2 className="mr-2 h-4 w-4" />
            Organization
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="mr-2 h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="mr-2 h-4 w-4" />
            Billing
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="userName">Full Name</Label>
                  <Input
                    id="userName"
                    value={userName as string}
                    onChange={(e) => updateFormData('userName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userEmail">Email</Label>
                  <Input id="userEmail" value={userEmail} disabled />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="userTimezone">Timezone</Label>
                  <Select value={userTimezone as string} onValueChange={(v) => updateFormData('userTimezone', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userLocale">Language</Label>
                  <Select value={userLocale as string} onValueChange={(v) => updateFormData('userLocale', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locales.map(loc => (
                        <SelectItem key={loc} value={loc}>{loc.toUpperCase()}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userTheme">Theme</Label>
                  <Select value={userTheme as string} onValueChange={(v) => updateFormData('userTheme', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                </div>
                <Button variant="outline">Enable 2FA</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">Update your password</p>
                </div>
                <Button variant="outline">Change</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Organization Tab */}
        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Details</CardTitle>
              <CardDescription>Manage your organization information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-16 w-16 bg-vivid-tangerine/20 flex items-center justify-center text-2xl font-bold text-vivid-tangerine">
                  {(orgName as string).charAt(0) || 'O'}
                </div>
                <div>
                  <p className="text-lg font-semibold">{orgName as string || 'Organization'}</p>
                  <Badge variant="secondary">{organization?.plan || 'free'}</Badge>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <Input
                    id="orgName"
                    value={orgName as string}
                    onChange={(e) => updateFormData('orgName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgWebsite">Website</Label>
                  <Input
                    id="orgWebsite"
                    value={orgWebsite as string}
                    onChange={(e) => updateFormData('orgWebsite', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgIndustry">Industry</Label>
                  <Select value={orgIndustry as string} onValueChange={(v) => updateFormData('orgIndustry', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map(ind => (
                        <SelectItem key={ind} value={ind.toLowerCase()}>{ind}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgSize">Company Size</Label>
                  <Select value={orgSize as string} onValueChange={(v) => updateFormData('orgSize', v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {companySizes.map(size => (
                        <SelectItem key={size} value={size}>{size}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="orgTimezone">Default Timezone</Label>
                  <Select value={orgTimezone as string} onValueChange={(v) => updateFormData('orgTimezone', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timezones.map(tz => (
                        <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="orgCurrency">Currency</Label>
                  <Select value={orgCurrency as string} onValueChange={(v) => updateFormData('orgCurrency', v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(cur => (
                        <SelectItem key={cur} value={cur}>{cur}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance Tab */}
        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GDPR Settings</CardTitle>
              <CardDescription>Configure data privacy and compliance settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">GDPR Compliance</p>
                  <p className="text-sm text-muted-foreground">Enable GDPR features for your organization</p>
                </div>
                <Switch
                  checked={gdprEnabled as boolean}
                  onCheckedChange={(checked) => updateFormData('gdprEnabled', checked)}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gdprRetention">Data Retention (days)</Label>
                  <Input
                    id="gdprRetention"
                    type="number"
                    value={gdprRetention as number}
                    onChange={(e) => updateFormData('gdprRetention', parseInt(e.target.value) || 30)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gdprEmail">GDPR Contact Email</Label>
                  <Input
                    id="gdprEmail"
                    type="email"
                    value={gdprEmail as string}
                    onChange={(e) => updateFormData('gdprEmail', e.target.value)}
                    placeholder="privacy@company.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Email notifications', desc: 'Receive email updates about your account' },
                { label: 'Campaign alerts', desc: 'Get notified when campaigns complete or have issues' },
                { label: 'Weekly digest', desc: 'Receive a weekly summary of your activity' },
                { label: 'Lead alerts', desc: 'Get notified when new leads are captured' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={i < 3} />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Billing Tab */}
        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>Manage your subscription and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border">
                <div>
                  <p className="font-semibold text-lg">{organization?.plan?.charAt(0).toUpperCase()}{organization?.plan?.slice(1) || 'Free'} Plan</p>
                  <p className="text-sm text-muted-foreground">Billed monthly</p>
                </div>
                <Button variant="outline">Upgrade Plan</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-border">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">No payment method</p>
                    <p className="text-sm text-muted-foreground">Add a payment method to upgrade</p>
                  </div>
                </div>
                <Button variant="outline">Add Card</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
