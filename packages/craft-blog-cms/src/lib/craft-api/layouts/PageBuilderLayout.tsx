'use client'

import { useCallback, useState } from 'react'
import { AppShell } from '../components/AppShell'
import { BlockRenderer } from '../components/BlockRenderer'
import { CraftLink } from '../components/CraftLink'
import { ViewInCraftButton } from '../components/ViewInCraftButton'
import { useLocalItems } from '../hooks/useLocalItems'
import type { LayoutProps } from '../templates/LayoutRenderer'
import type { CraftBlock } from '../types'

export function PageBuilderLayout({ items, actions, options }: LayoutProps) {
  const showMetadata = options.showMetadata as boolean | undefined
  const readOnly = options.readOnly as boolean | undefined

  const { currentItems, updateTitle, deleteItem, createItem } = useLocalItems(items, actions)
  const [addingBlock, setAddingBlock] = useState(false)
  const [newBlockText, setNewBlockText] = useState('')

  const pageCraftLink = currentItems.length > 0 ? currentItems[0].craftLink : undefined

  const blocks: CraftBlock[] = currentItems.map((item) => ({
    id: item.id,
    type: (item.fields.type as CraftBlock['type']) || 'text',
    markdown: item.title,
    textStyle: (item.fields.textStyle as CraftBlock['textStyle']) || 'p',
    listStyle: (item.fields.listStyle as CraftBlock['listStyle']) || undefined,
    indentationLevel: item.fields.indentationLevel as number | undefined,
    taskInfo: item.fields.taskInfo as CraftBlock['taskInfo'],
    children: item.fields.children as CraftBlock[] | undefined
  }))

  const canEdit = !readOnly && !!actions

  const handleUpdate = useCallback(
    (blockId: string, markdown: string) => {
      updateTitle(blockId, markdown)
    },
    [updateTitle]
  )

  const handleInsert = useCallback(async () => {
    if (!newBlockText.trim()) return
    await createItem({ title: newBlockText.trim() })
    setNewBlockText('')
    setAddingBlock(false)
  }, [createItem, newBlockText])

  return (
    <AppShell>
      {() => (
        <div className="h-full overflow-auto">
          <div className="mx-auto max-w-2xl px-6 py-4">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-200 pb-3 text-xs text-gray-400">
              {showMetadata && <span>{blocks.length} blocks</span>}
              <div className="flex-1" />
              <ViewInCraftButton items={currentItems} size="sm" />
              <CraftLink href={pageCraftLink} />
            </div>

            <div className="pl-5">
              <BlockRenderer
                blocks={blocks}
                onUpdate={canEdit && actions?.update ? handleUpdate : undefined}
                onDelete={canEdit && actions?.delete ? deleteItem : undefined}
              />
            </div>

            {canEdit && actions?.create && (
              <div className="mt-4 pl-5">
                {addingBlock ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                    <textarea
                      value={newBlockText}
                      onChange={(e) => setNewBlockText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleInsert()
                        }
                        if (e.key === 'Escape') {
                          setAddingBlock(false)
                          setNewBlockText('')
                        }
                      }}
                      autoFocus
                      rows={2}
                      placeholder="Enter block text…"
                      className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={handleInsert}
                        className="rounded-md bg-gray-900 px-3 py-1 text-xs font-medium text-white hover:bg-gray-800"
                      >
                        Add Block
                      </button>
                      <button
                        onClick={() => {
                          setAddingBlock(false)
                          setNewBlockText('')
                        }}
                        className="rounded-md px-3 py-1 text-xs text-gray-500 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setAddingBlock(true)}
                    className="flex w-full items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-2 text-xs text-gray-400 hover:border-gray-400 hover:text-gray-500"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add block
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </AppShell>
  )
}
