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
  const { members, addMember } = useMembers(group?.id)
  const { expenses, addExpense, updateExpense, deleteExpense } = useExpenses(group?.id)
  const { settlements, addSettlement } = useSettlements(group?.id)

  const [activeTab, setActiveTab] = useState<Tab>('expenses')
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  if (groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass rounded-2xl shadow-fluent px-8 py-6">
          <p className="text-gray-500 text-lg font-medium">Loading group...</p>
        </div>
      </div>
    )
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="glass-strong rounded-3xl shadow-fluent-lg p-10 text-center max-w-sm">
          <h2 className="text-2xl font-bold text-gray-800">Group not found</h2>
          <p className="mt-3 text-gray-500">
            This group doesn't exist or the link is invalid.
          </p>
        </div>
      </div>
    )
  }

  if (!memberId) {
    return (
      <JoinGroupDialog
        open
        groupName={group.name}
        onJoin={async (name) => {
          const member = await addMember(name)
          setIdentity(member.id, member.name)
        }}
      />
    )
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
            <MemberList members={members} currentMemberId={memberId} />
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
              {tab === 'expenses' ? 'Expenses' : 'Balances'}
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
              onDelete={deleteExpense}
            />
          )}

          {activeTab === 'balances' && (
            <BalanceView
              expenses={expenses}
              settlements={settlements}
              members={members}
              currentMemberId={memberId}
              currency={group.currency}
              onSettle={addSettlement}
            />
          )}
        </div>
      </div>

      {/* Floating add button */}
      {activeTab === 'expenses' && (
        <div className="fixed bottom-6 right-6">
          <Button
            size="lg"
            className="rounded-full shadow-fluent-lg px-7"
            onClick={() => {
              setEditingExpense(null)
              setExpenseDialogOpen(true)
            }}
          >
            + Add Expense
          </Button>
        </div>
      )}

      {/* Expense Dialog */}
      <Dialog
        open={expenseDialogOpen}
        onClose={handleCloseExpenseDialog}
        title={editingExpense ? 'Edit Expense' : 'Add Expense'}
      >
        <ExpenseForm
          members={members}
          currentMemberId={memberId}
          initialData={editingExpense ?? undefined}
          onCancel={handleCloseExpenseDialog}
          onSubmit={async (data) => {
            if (editingExpense) {
              await updateExpense(editingExpense.id, data)
            } else {
              await addExpense(data)
            }
            handleCloseExpenseDialog()
          }}
        />
      </Dialog>
    </div>
  )
}
