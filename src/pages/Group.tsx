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
        <p className="text-gray-500 text-lg">Loading group...</p>
      </div>
    )
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Group not found</h2>
          <p className="mt-2 text-gray-500">
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>

        {/* Members */}
        <div className="mt-4">
          <MemberList members={members} currentMemberId={memberId} />
        </div>

        {/* Tabs */}
        <div className="mt-6 flex gap-1 bg-gray-200 rounded-lg p-1">
          {(['expenses', 'balances'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors',
                activeTab === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {tab === 'expenses' ? 'Expenses' : 'Balances'}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="mt-4">
          {activeTab === 'expenses' && (
            <>
              <ExpenseList
                expenses={expenses}
                members={members}
                currentMemberId={memberId}
                currency={group.currency}
                onEdit={handleEdit}
                onDelete={deleteExpense}
              />

              {/* Floating add button */}
              <div className="fixed bottom-6 right-6">
                <Button
                  size="lg"
                  className="rounded-full shadow-lg px-6"
                  onClick={() => {
                    setEditingExpense(null)
                    setExpenseDialogOpen(true)
                  }}
                >
                  + Add Expense
                </Button>
              </div>
            </>
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
