'use client'

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { CheckCircle2, AlertCircle, Clock, Play } from 'lucide-react'

interface ExecutionLogModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    run: any // Replace with proper type when available
}

export function ExecutionLogModal({ open, onOpenChange, run }: ExecutionLogModalProps) {
    if (!run) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        Execution Log: {run.workflow.name}
                        <Badge
                            variant={
                                run.status === 'completed'
                                    ? 'default'
                                    : run.status === 'failed'
                                        ? 'destructive'
                                        : 'secondary'
                            }
                            className={
                                run.status === 'completed'
                                    ? 'bg-green-500 text-white'
                                    : run.status === 'running'
                                        ? 'bg-vivid-tangerine text-white'
                                        : ''
                            }
                        >
                            {run.status}
                        </Badge>
                    </DialogTitle>
                    <DialogDescription>
                        Started on {new Date(run.createdAt).toLocaleString()}
                    </DialogDescription>
                </DialogHeader>

                <ScrollArea className="flex-1 pr-4 mt-4">
                    <div className="space-y-4">
                        {run.steps?.map((step: any, index: number) => (
                            <div key={step.id} className="flex gap-4 border-l-2 border-border pl-4 pb-4">
                                <div className="mt-1">
                                    {step.status === 'completed' ? (
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    ) : step.status === 'failed' ? (
                                        <AlertCircle className="h-4 w-4 text-red-500" />
                                    ) : (
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{step.nodeType} Step</p>
                                    <p className="text-xs text-muted-foreground">
                                        {step.duration ? `${(step.duration / 1000).toFixed(2)}s` : 'Processing...'}
                                    </p>
                                    {step.error && (
                                        <p className="text-xs text-red-500 mt-1 bg-red-500/10 p-2 rounded">
                                            {step.error}
                                        </p>
                                    )}
                                    {step.output && (
                                        <pre className="text-[10px] mt-2 bg-muted p-2 rounded overflow-x-auto">
                                            {JSON.stringify(JSON.parse(step.output), null, 2)}
                                        </pre>
                                    )}
                                </div>
                            </div>
                        ))}
                        {(!run.steps || run.steps.length === 0) && (
                            <div className="text-center py-8 text-muted-foreground italic">
                                No step details available yet.
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </DialogContent>
        </Dialog>
    )
}
