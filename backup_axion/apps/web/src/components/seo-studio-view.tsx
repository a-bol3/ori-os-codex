'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  TrendingUp,
  Globe,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  ExternalLink,
  Plus,
  RefreshCw,
  Eye,
  Link,
  Target,
  Sparkles,
  FileText,
  Activity,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'

// Mock data for SEO Studio
const mockProjects = [
  { id: '1', name: 'ori-os.com', domain: 'ori-os.com', status: 'connected', keywords: 847, avgPosition: 14.2, clicks: 12400 },
  { id: '2', name: 'Client A Website', domain: 'client-a.com', status: 'connected', keywords: 324, avgPosition: 23.5, clicks: 4200 },
  { id: '3', name: 'Partner Blog', domain: 'partner-blog.io', status: 'pending', keywords: 0, avgPosition: 0, clicks: 0 },
]

const mockKeywords = [
  { id: '1', term: 'revenue os', position: 3, change: 2, volume: 1200, difficulty: 45 },
  { id: '2', term: 'b2b crm platform', position: 8, change: -1, volume: 890, difficulty: 52 },
  { id: '3', term: 'outbound automation', position: 5, change: 3, volume: 2100, difficulty: 38 },
  { id: '4', term: 'lead enrichment tool', position: 12, change: 0, volume: 650, difficulty: 61 },
  { id: '5', term: 'sales engagement software', position: 15, change: -2, volume: 1800, difficulty: 55 },
]

const mockIssues = [
  { id: '1', type: 'critical', page: '/pricing', issue: 'Missing meta description', status: 'open' },
  { id: '2', type: 'warning', page: '/features', issue: 'Duplicate H1 tags', status: 'open' },
  { id: '3', type: 'info', page: '/blog/seo-tips', issue: 'Image missing alt text', status: 'fixed' },
  { id: '4', type: 'critical', page: '/contact', issue: 'Broken internal link', status: 'open' },
]

const mockContentAnalysis = [
  { id: '1', url: '/features', score: 78, wordCount: 1450, competitors: 10, gaps: 3 },
  { id: '2', url: '/pricing', score: 85, wordCount: 980, competitors: 10, gaps: 1 },
  { id: '3', url: '/blog/outbound-guide', score: 62, wordCount: 2100, competitors: 10, gaps: 5 },
]

export function SEOStudioView() {
  const [activeTab, setActiveTab] = useState('overview')
  const [selectedProject, setSelectedProject] = useState(mockProjects[0])
  const { setMarketingPage, setCurrentView } = useAppStore()

  const handleSync = () => {
    toast.success('Syncing data from Google Search Console...')
  }

  const handleNewProject = () => {
    toast.info('Create a new SEO project from the Settings page')
  }

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return 'destructive'
      case 'warning': return 'default'
      default: return 'secondary'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500'
    if (score >= 60) return 'text-yellow-500'
    return 'text-red-500'
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO Studio</h1>
          <p className="text-muted-foreground">Manage inbound growth and technical SEO</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={handleSync}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync GSC
          </Button>
          <Button 
            size="sm" 
            className="bg-vivid-tangerine hover:bg-tangerine-dark"
            onClick={handleNewProject}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Project Selector */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {mockProjects.map((project) => (
              <button
                key={project.id}
                onClick={() => setSelectedProject(project)}
                className={`flex items-center gap-3 px-4 py-2 border transition whitespace-nowrap ${
                  selectedProject.id === project.id
                    ? 'border-vivid-tangerine bg-vivid-tangerine/10'
                    : 'border-border hover:bg-muted/50'
                }`}
              >
                <Globe className="h-4 w-4 text-muted-foreground" />
                <div className="text-left">
                  <p className="font-medium text-sm">{project.name}</p>
                  <p className="text-xs text-muted-foreground">{project.domain}</p>
                </div>
                {project.status === 'connected' ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="issues">Technical Issues</TabsTrigger>
          <TabsTrigger value="content">Content Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Activity className="h-8 w-8 text-vivid-tangerine" />
                  <div>
                    <p className="text-sm text-muted-foreground">Organic Clicks</p>
                    <p className="text-xl font-bold">{selectedProject.clicks.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Search className="h-8 w-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tracked Keywords</p>
                    <p className="text-xl font-bold">{selectedProject.keywords}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Position</p>
                    <p className="text-xl font-bold">{selectedProject.avgPosition}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Open Issues</p>
                    <p className="text-xl font-bold">{mockIssues.filter(i => i.status === 'open').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Organic Performance</CardTitle>
              <CardDescription>Last 30 days click and impression trends</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-muted/30 border border-border">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Performance chart will appear here</p>
                  <Button 
                    variant="link" 
                    className="text-vivid-tangerine mt-2"
                    onClick={() => toast.info('Connect Google Search Console for live data')}
                  >
                    Connect GSC for live data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Top Keywords Preview */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Top Performing Keywords</CardTitle>
                <CardDescription>Keywords driving the most traffic</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => setActiveTab('keywords')}>
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockKeywords.slice(0, 5).map((keyword) => (
                  <div key={keyword.id} className="flex items-center justify-between p-3 border border-border hover:bg-muted/50 transition">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 bg-vivid-tangerine/20 flex items-center justify-center">
                        <Target className="h-4 w-4 text-vivid-tangerine" />
                      </div>
                      <div>
                        <p className="font-medium">{keyword.term}</p>
                        <p className="text-xs text-muted-foreground">Volume: {keyword.volume.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-bold">#{keyword.position}</p>
                        <p className={`text-xs ${keyword.change > 0 ? 'text-green-500' : keyword.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {keyword.change > 0 ? `+${keyword.change}` : keyword.change}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={() => setActiveTab('keywords')}
            >
              <Search className="h-6 w-6 text-vivid-tangerine" />
              <span>Add Keywords</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={() => setActiveTab('issues')}
            >
              <AlertCircle className="h-6 w-6 text-yellow-500" />
              <span>Run Site Audit</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={() => setActiveTab('content')}
            >
              <FileText className="h-6 w-6 text-blue-500" />
              <span>Analyze Content</span>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="keywords" className="space-y-6">
          {/* Keyword Search */}
          <Card>
            <CardContent className="p-4">
              <div className="flex gap-3">
                <Input placeholder="Search keywords..." className="flex-1" />
                <Button className="bg-vivid-tangerine hover:bg-tangerine-dark">
                  <Search className="mr-2 h-4 w-4" />
                  Search
                </Button>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Keywords
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle>Tracked Keywords</CardTitle>
              <CardDescription>Monitor rankings and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockKeywords.map((keyword) => (
                  <motion.div
                    key={keyword.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 border border-border hover:bg-muted/50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 bg-vivid-tangerine/20 flex items-center justify-center">
                        <Target className="h-5 w-5 text-vivid-tangerine" />
                      </div>
                      <div>
                        <p className="font-medium">{keyword.term}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>Volume: {keyword.volume.toLocaleString()}</span>
                          <span>Difficulty: {keyword.difficulty}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Position</p>
                        <p className="text-lg font-bold">#{keyword.position}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">Change</p>
                        <p className={`text-lg font-bold ${keyword.change > 0 ? 'text-green-500' : keyword.change < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {keyword.change > 0 ? `+${keyword.change}` : keyword.change}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => toast.info('Keyword details coming soon')}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-6">
          {/* Issues Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-red-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Critical</p>
                    <p className="text-xl font-bold">{mockIssues.filter(i => i.type === 'critical').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <p className="text-xl font-bold">{mockIssues.filter(i => i.type === 'warning').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                  <div>
                    <p className="text-sm text-muted-foreground">Fixed</p>
                    <p className="text-xl font-bold">{mockIssues.filter(i => i.status === 'fixed').length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Issues List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Technical Issues</CardTitle>
                <CardDescription>Site audit findings and recommendations</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast.info('Starting new site crawl...')}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Run Audit
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockIssues.map((issue) => (
                  <div key={issue.id} className="flex items-center justify-between p-4 border border-border">
                    <div className="flex items-center gap-4">
                      <Badge variant={getIssueColor(issue.type) as "destructive" | "default" | "secondary"}>
                        {issue.type}
                      </Badge>
                      <div>
                        <p className="font-medium">{issue.issue}</p>
                        <p className="text-sm text-muted-foreground">{issue.page}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant={issue.status === 'fixed' ? 'default' : 'secondary'}>
                        {issue.status}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Content Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Content Analysis</CardTitle>
              <CardDescription>Compare your pages against top competitors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockContentAnalysis.map((page) => (
                  <div key={page.id} className="p-4 border border-border hover:bg-muted/50 transition">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <span className="font-medium">{page.url}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Content Score:</span>
                        <span className={`text-lg font-bold ${getScoreColor(page.score)}`}>{page.score}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Word Count</p>
                        <p className="font-medium">{page.wordCount.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Competitors Analyzed</p>
                        <p className="font-medium">{page.competitors}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Content Gaps</p>
                        <p className="font-medium">{page.gaps} topics</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={page.score} className="h-2" />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => toast.info('Opening detailed analysis...')}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Analysis
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => toast.info('Generating recommendations...')}>
                        <Sparkles className="mr-2 h-4 w-4" />
                        AI Recommendations
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Start New Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Analyze New Page</CardTitle>
              <CardDescription>Enter a URL and target keyword to analyze</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Input placeholder="Enter page URL (e.g., /blog/seo-guide)" className="flex-1" />
                <Input placeholder="Target keyword" className="w-64" />
                <Button className="bg-vivid-tangerine hover:bg-tangerine-dark">
                  <Search className="mr-2 h-4 w-4" />
                  Analyze
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer CTA */}
      <Card className="bg-gradient-to-r from-vivid-tangerine/10 to-transparent border-vivid-tangerine/30">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Learn more about SEO Studio</h3>
              <p className="text-muted-foreground">Discover all features and capabilities</p>
            </div>
            <Button 
              variant="outline" 
              className="border-vivid-tangerine text-vivid-tangerine hover:bg-vivid-tangerine hover:text-white"
              onClick={() => {
                setMarketingPage('seo-studio')
                setCurrentView('marketing')
              }}
            >
              View Full Feature List
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
