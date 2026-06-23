import { notFound } from 'next/navigation'
import { getAgentById } from '@/lib/mock-data'
import { AgentShell } from '@/components/agent/agent-shell'

interface AgentDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { id } = await params
  const agent = getAgentById(id)

  if (!agent) {
    notFound()
  }

  return <AgentShell agent={agent} />
}
