import { mockAgents, Agent } from '@/lib/mock-data'
import { AgentShell } from '@/components/agent/agent-shell'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function AgentDetailPage({ params }: Props) {
  const { id } = await params
  const agent: Agent | undefined = mockAgents.find((a) => a.id === id)

  if (!agent) {
    notFound()
  }

  return <AgentShell agent={agent} />
}
