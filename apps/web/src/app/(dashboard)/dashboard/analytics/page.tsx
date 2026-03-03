'use client';

import { motion } from 'framer-motion';

import { BarChart3, TrendingUp, Users, DollarSign, Target, Calendar, Download, Loader, PieChart, Activity, Zap, Mail } from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';
import { exportToCSV } from '@/lib/export';
import {
    useToast,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
    Button
} from '@ori-os/ui';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';

export default function AnalyticsPage() {
    const { data, isLoading } = useAnalytics();
    const { toast } = useToast();

    const handleExport = () => {
        if (!data) return;
        exportToCSV([
            { label: 'Revenue', value: data.revenue.total },
            { label: 'Leads', value: data.leads.total },
            { label: 'Conversion', value: data.conversion.total },
        ], 'analytics-summary');
        toast({ title: 'Export Successful', description: 'Analytics data exported to CSV.' });
    };

    if (isLoading || !data) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader className="h-8 w-8 animate-spin text-tangerine" />
            </div>
        );
    }

    const kpis = [
        { label: 'Total Revenue', value: data.revenue.total, change: data.revenue.change, icon: DollarSign, trend: data.revenue.trend },
        { label: 'New Leads', value: data.leads.total, change: data.leads.change, icon: Users, trend: data.leads.trend },
        { label: 'Conversion Rate', value: data.conversion.total, change: data.conversion.change, icon: Target, trend: data.conversion.trend },
        { label: 'Avg Deal Size', value: data.dealSize.total, change: data.dealSize.change, icon: TrendingUp, trend: data.dealSize.trend },
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
                    <p className="text-muted-foreground">Track performance and gain insights</p>
                </div>
                <div className="flex gap-2">
                    <Select defaultValue="30d">
                        <SelectTrigger className="w-36"><SelectValue placeholder="Time range" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">Last 7 days</SelectItem>
                            <SelectItem value="30d">Last 30 days</SelectItem>
                            <SelectItem value="90d">Last 90 days</SelectItem>
                            <SelectItem value="1y">Last year</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={handleExport}><Download className="mr-2 h-4 w-4" />Export</Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi) => (
                    <Card key={kpi.label}>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4 group">
                                <span className="text-sm text-muted-foreground">{kpi.label}</span>
                                <kpi.icon className="h-5 w-5 text-tangerine transition-transform duration-300 group-hover:-translate-y-0.5" />
                            </div>
                            <div className="text-3xl font-bold text-foreground">{kpi.value}</div>
                            <div className={`text-sm mt-1 ${kpi.trend === 'up' ? 'text-success' : 'text-destructive'}`}>
                                {kpi.change} vs last period
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="funnels">Funnels</TabsTrigger>
                    <TabsTrigger value="retention">Retention</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Revenue Over Time</CardTitle>
                                <CardDescription>Monthly recurring revenue trend</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-4">
                                <div className="h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data.revenueTrend}>
                                            <defs>
                                                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#FB923C" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#FB923C" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                                            <Tooltip />
                                            <Area type="monotone" dataKey="revenue" stroke="#FB923C" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Lead Sources</CardTitle>
                                <CardDescription>Where your leads come from</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {data.sources.map((source) => (
                                        <div key={source.source}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm text-foreground">{source.source}</span>
                                                <span className="text-sm text-muted-foreground">{source.value}%</span>
                                            </div>
                                            <div className="h-2 bg-muted rounded-none overflow-hidden">
                                                <div className={`h-full ${source.color} rounded-none`} style={{ width: `${source.value}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="funnels" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Sales Conversion Funnel</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-6">
                                    {(data.funnel || []).map((step, index) => {
                                        const percent = data.funnel[0]?.count ? Math.round((step.count / data.funnel[0].count) * 100) : 0;
                                        const colors = ['bg-slate-400', 'bg-blue-400', 'bg-purple-400', 'bg-tangerine', 'bg-green-400'];
                                        const color = colors[index % colors.length];
                                        return (
                                            <div key={step.stage}>
                                                <div className="flex justify-between mb-2">
                                                    <span className="text-sm font-medium">{step.stage}</span>
                                                    <span className="text-sm text-muted-foreground">{step.count} ({percent}%)</span>
                                                </div>
                                                <div className="h-4 bg-muted rounded-none overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${percent}%` }}
                                                        viewport={{ once: true }}
                                                        className={`h-full ${color} rounded-none`}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Conversion Insights</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="p-4 rounded-none bg-green-500/10 border border-green-500/20">
                                    <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">Winning Factor</div>
                                    <p className="text-xs text-muted-foreground">Quick responses in &lt; 5 mins increase close rates by 34%.</p>
                                </div>
                                <div className="p-4 rounded-none bg-tangerine/10 border border-tangerine/20">
                                    <div className="text-sm font-medium text-tangerine mb-1">Bottleneck Detected</div>
                                    <p className="text-xs text-muted-foreground">High drop-off (62%) between Qualification and Proposal stages.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="retention" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer Retention (Cohort Analysis)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b">
                                            <th className="text-left p-2">Cohort</th>
                                            <th className="text-left p-2">Size</th>
                                            {[1, 2, 3, 4, 5, 6].map(m => <th key={m} className="p-2">Month {m}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[
                                            { name: 'July 2023', size: 120, data: [100, 92, 88, 85, 82, 80] },
                                            { name: 'Aug 2023', size: 145, data: [100, 95, 90, 84, 80] },
                                            { name: 'Sep 2023', size: 130, data: [100, 93, 89, 85] },
                                            { name: 'Oct 2023', size: 160, data: [100, 96, 92] },
                                        ].map((cohort) => (
                                            <tr key={cohort.name} className="border-b last:border-0">
                                                <td className="p-2 font-medium">{cohort.name}</td>
                                                <td className="p-2 text-muted-foreground">{cohort.size}</td>
                                                {cohort.data.map((val, i) => (
                                                    <td key={i} className="p-2 text-center">
                                                        <div className={`p-1 rounded-none ${val > 90 ? 'bg-green-500/40' : val > 85 ? 'bg-green-500/20' : 'bg-green-500/10'}`}>
                                                            {val}%
                                                        </div>
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="events" className="mt-6">
                    <div className="space-y-4">
                        {[
                            { name: 'Email Opened', category: 'Engagement', count: '1.2M', trend: '+12%', icon: Mail },
                            { name: 'Link Clicked', category: 'Engagement', count: '450K', trend: '+8%', icon: Activity },
                            { name: 'Form Submitted', category: 'Conversion', count: '12K', trend: '+20%', icon: Zap },
                            { name: 'Deal stage Changed', category: 'CRM', count: '4.5K', trend: '+5%', icon: TrendingUp },
                        ].map((event) => (
                            <Card key={event.name} hover="lift" className="group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 rounded-none bg-muted group-hover:bg-tangerine/10 transition-colors">
                                            <event.icon className="h-5 w-5 text-tangerine transition-transform duration-300 group-hover:-translate-y-0.5" />
                                        </div>
                                        <div>
                                            <div className="font-medium">{event.name}</div>
                                            <div className="text-xs text-muted-foreground">{event.category}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold">{event.count}</div>
                                        <div className="text-xs text-success">{event.trend}</div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
