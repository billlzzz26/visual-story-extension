'use client'

import { Suspense } from 'react'
import type { CraftApiClient } from '../client'
import { LoadingState } from '../components/LoadingState'
import type { DataSourceActions, DisplayItem, FieldSchema, LayoutType } from '../types'
import { PageBuilderLayout } from '../layouts/PageBuilderLayout'

export interface LayoutProps {
  items: DisplayItem[]
  schema: FieldSchema[]
  actions?: DataSourceActions
  options: Record<string, unknown>
  client?: CraftApiClient
}

export function LayoutRenderer({ layout, items, schema, actions, options, client }: LayoutProps & { layout: LayoutType }) {
  const accentColor = (options._accentColor as string) || undefined
  return (
    <Suspense fallback={<LoadingState />}>
      <div style={accentColor ? { '--accent': accentColor } as React.CSSProperties : undefined}>
        <PageBuilderLayout items={items} schema={schema} actions={actions} options={options} client={client} />
      </div>
    </Suspense>
  )
}
