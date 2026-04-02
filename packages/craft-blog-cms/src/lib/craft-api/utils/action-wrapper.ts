import { toast } from 'sonner'
import { CraftApiError } from '../client'
import type { DataSourceActions } from '../types'

function getErrorMessage(error: unknown): string {
  if (error instanceof CraftApiError) return error.humanMessage
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Could not reach Craft — check your connection.'
  }
  return 'An unexpected error occurred.'
}

type AsyncFn = (...args: never[]) => Promise<unknown>

function wrapAction(fn: AsyncFn): AsyncFn {
  return (async (...args: never[]) => {
    try {
      return await fn(...args)
    } catch (error) {
      // Let forms handle validation errors inline instead of toasting
      if (error instanceof CraftApiError && (error.status === 400 || error.status === 422)) {
        throw error
      }
      toast.error(getErrorMessage(error))
      throw error
    }
  }) as AsyncFn
}

export function wrapActionsWithToast(actions?: DataSourceActions): DataSourceActions | undefined {
  if (!actions) return actions
  return {
    create: actions.create ? (wrapAction(actions.create as AsyncFn) as DataSourceActions['create']) : undefined,
    update: actions.update ? (wrapAction(actions.update as AsyncFn) as DataSourceActions['update']) : undefined,
    delete: actions.delete ? (wrapAction(actions.delete as AsyncFn) as DataSourceActions['delete']) : undefined
  }
}
