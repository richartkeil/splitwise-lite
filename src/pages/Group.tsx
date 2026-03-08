import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useGroup } from '@/hooks/useGroup'
import { useLocalIdentity } from '@/hooks/useLocalIdentity'
import { useMembers } from '@/hooks/useMembers'
import { useExpenses } from '@/hooks/useExpenses'
import { useSettlements } from '@/hooks/useSettlements'
import type { Expense } from '@/lib/types'
import { cn } from '@/lib/utils'
import { JoinGroupDialog } from '@/components/JoinGroupDialog'
import { ExpenseList } from '@/components/ExpenseList'
import { ExpenseForm } from '@/components/ExpenseForm'
import { BalanceView } from '@/components/BalanceView'
import { MemberList } from '@/components/MemberList'
import { Dialog } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'

type Tab = 'expenses' | 'balances'

export default function Group() {
  const { slug } = useParams<{ slug: string }>()
  const { group, loading: groupLoading, error: groupError } = useGroup(slug ?? '')
  const { memberId, setIdentity } = useLocalIdentity(slug ?? '')
  const { members, addMember, loading: membersLoading } = useMembers(group?.id)
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(group?.id)
  const { settlements, addSettlement, deleteSettlement } = useSettlements(group?.id)

  const [activeTab, setActiveTab] = useState<Tab>('expenses')
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl shadow-fluent px-8 py-6">
          <p className="text-gray-500 text-lg font-medium">Gruppe wird geladen...</p>
        </div>
      </div>
    )
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl shadow-fluent-lg p-10 text-center max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800">Gruppe nicht gefunden</h2>
          <p className="mt-3 text-gray-500">
            Diese Gruppe existiert nicht oder der Link ist ungültig.
          </p>
        </div>
      </div>
    )
  }

  const memberExists = members.some(m => m.id === memberId)
  const needsToJoin = !memberId || (memberId && !membersLoading && members.length > 0 && !memberExists)

  if (needsToJoin) {
    return (
      <JoinGroupDialog
        open
        groupName={group.name}
        members={members}
        onJoin={async (name) => {
          setSubmitting(true)
          try {
            const member = await addMember(name)
            setIdentity(member.id, member.name)
          } catch (e) {
            const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
            setError(msg)
            setTimeout(() => setError(null), 4000)
          } finally {
            setSubmitting(false)
          }
        }}
        onClaim={(claimedId) => {
          const member = members.find(m => m.id === claimedId)
          if (member) {
            setIdentity(member.id, member.name)
          }
        }}
      />
    )
  }

  async function handleDelete(expenseId: string) {
    setSubmitting(true)
    try {
      await deleteExpense(expenseId)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
      setError(msg)
      setTimeout(() => setError(null), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleSettle(fromId: string, toId: string, amount: number) {
    setSubmitting(true)
    try {
      await addSettlement(fromId, toId, amount)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
      setError(msg)
      setTimeout(() => setError(null), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteSettlement(settlementId: string) {
    setSubmitting(true)
    try {
      await deleteSettlement(settlementId)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
      setError(msg)
      setTimeout(() => setError(null), 4000)
    } finally {
      setSubmitting(false)
    }
  }

  function handleEdit(expense: Expense) {
    setEditingExpense(expense)
    setExpenseDialogOpen(true)
  }

  function handleCloseExpenseDialog() {
    setExpenseDialogOpen(false)
    setEditingExpense(null)
  }

  return (
    <div className="min-h-screen pb-24">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <div className="glass-strong rounded-2xl shadow-fluent px-6 py-5">
          <h1 className="text-2xl font-bold text-gray-800">{group.name}</h1>
          <div className="mt-3">
            <MemberList
              members={members}
              currentMemberId={memberId}
              onAddMember={async (name) => {
                await addMember(name)
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-5 flex gap-1 glass rounded-2xl p-1.5 shadow-fluent">
          {(['expenses', 'balances'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200',
                activeTab === tab
                  ? 'bg-white text-gray-800 shadow-md'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-white/40',
              )}
            >
              {tab === 'expenses' ? 'Ausgaben' : 'Salden'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'expenses' && (
            <ExpenseList
              expenses={expenses}
              members={members}
              currentMemberId={memberId}
              currency={group.currency}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {activeTab === 'balances' && (
            <BalanceView
              expenses={expenses}
              settlements={settlements}
              members={members}
              currentMemberId={memberId}
              currency={group.currency}
              onSettle={handleSettle}
              onDeleteSettlement={handleDeleteSettlement}
            />
          )}
        </div>
      </div>

      {/* Floating add button */}
      {activeTab === 'expenses' && (
        <div className="fixed bottom-6 left-0 right-0 flex justify-center pointer-events-none">
          <Button
            size="lg"
            className="rounded-full shadow-fluent-lg px-7 pointer-events-auto"
            disabled={submitting}
            onClick={() => {
              setEditingExpense(null)
              setExpenseDialogOpen(true)
            }}
          >
            + Ausgabe hinzufügen
          </Button>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="fixed bottom-20 left-0 right-0 flex justify-center pointer-events-none z-50">
          <div className="glass rounded-2xl shadow-fluent bg-red-500/10 border border-red-300/40 backdrop-blur-md px-6 py-3 pointer-events-auto max-w-lg mx-4">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Expense Dialog */}
      <Dialog
        open={expenseDialogOpen}
        onClose={handleCloseExpenseDialog}
        title={editingExpense ? 'Ausgabe bearbeiten' : 'Ausgabe hinzufügen'}
      >
        <ExpenseForm
          members={members}
          currentMemberId={memberId}
          initialData={editingExpense ?? undefined}
          submitting={submitting}
          onCancel={handleCloseExpenseDialog}
          onSubmit={async (data) => {
            setSubmitting(true)
            try {
              if (editingExpense) {
                await updateExpense(editingExpense.id, data)
              } else {
                await addExpense(data)
              }
              handleCloseExpenseDialog()
            } catch (e) {
              const msg = e instanceof Error ? e.message : 'Unbekannter Fehler'
              setError(msg)
              setTimeout(() => setError(null), 4000)
            } finally {
              setSubmitting(false)
            }
          }}
        />
      </Dialog>
    </div>
  )
}
