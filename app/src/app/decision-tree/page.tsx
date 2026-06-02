'use client';

import { useMemo, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HeroPanel, PageShell } from '@/components/academy';
import { ArrowRightLeft, RefreshCcw } from 'lucide-react';
import {
  decisionTreeNodes,
  decisionTreeRootId,
  getDecisionTreeNodeById,
  type DecisionTreeNode,
} from '@/lib/decisionTree';

const STORAGE_KEY = 'avance_decision_tree_history_v1';

const getInitialHistory = () => {
  if (typeof window === 'undefined') {
    return [decisionTreeRootId];
  }

  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return [decisionTreeRootId];
  }

  try {
    const parsed = JSON.parse(stored) as unknown;
    if (Array.isArray(parsed) && parsed.every((item) => typeof item === 'string') && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // ignore invalid storage state
  }

  return [decisionTreeRootId];
};

export default function DecisionTreePage() {
  const [history, setHistory] = useState<string[]>(getInitialHistory);

  const currentNode = useMemo<DecisionTreeNode>(() => {
    const id = history[history.length - 1] ?? decisionTreeRootId;
    return getDecisionTreeNodeById(id) ?? decisionTreeNodes[0];
  }, [history]);

  const handleSelectOption = (nextId: string) => {
    const nextHistory = [...history, nextId];
    setHistory(nextHistory);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextHistory));
  };

  const handleRestart = () => {
    setHistory([decisionTreeRootId]);
    window.localStorage.removeItem(STORAGE_KEY);
  };

  const breadcrumbs = history.map((nodeId, index) => {
    const node = getDecisionTreeNodeById(nodeId);
    return {
      id: nodeId,
      title: node?.title ?? 'Unknown',
      isCurrent: index === history.length - 1,
    };
  });

  return (
    <Layout>
      <PageShell
        eyebrow="Guided trouble-shooting"
        title="Decision Tree"
        subtitle="Work through common MSP issues step by step with saved progress and repeatable actions."
        actions={
          <Button variant="outline" size="sm" onClick={handleRestart}>
            <RefreshCcw className="mr-2 h-4 w-4" /> Restart guide
          </Button>
        }
      >
        <HeroPanel
          title="Find the right next step"
          subtitle="Choose the issue, answer the key triage questions, and follow the recommended actions."
          illustration={<ArrowRightLeft size={72} className="text-blue-500" />}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between gap-4">
              <span>Progress</span>
              <Badge variant="outline">Saved in browser</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {breadcrumbs.map((crumb, index) => (
              <Badge key={crumb.id} variant={crumb.isCurrent ? 'secondary' : 'outline'}>
                {crumb.title}
                {index < breadcrumbs.length - 1 ? ' ›' : ''}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{currentNode.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{currentNode.question}</p>
                {currentNode.description && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/80">
                    {currentNode.description}
                  </div>
                )}
                <div className="grid gap-3 sm:grid-cols-2">
                  {currentNode.options.map((option) => (
                    <Button
                      key={option.nextId}
                      onClick={() => handleSelectOption(option.nextId)}
                      className="justify-start"
                      variant="outline"
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {currentNode.id.startsWith('result-') && (
              <Card>
                <CardHeader>
                  <CardTitle>Recommended actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Use the action summary above to capture your next ticket note, update your KB, or follow up with the client.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>How to use this guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Select the issue closest to the user report.</p>
              <p>Answer the prompts to narrow the cause and get the safest recommended action.</p>
              <p>Restart at any time to pick a different issue or repeat the flow.</p>
              <p>Your progress is kept in browser storage so you can return without losing your place.</p>
            </CardContent>
          </Card>
        </div>
      </PageShell>
    </Layout>
  );
}
