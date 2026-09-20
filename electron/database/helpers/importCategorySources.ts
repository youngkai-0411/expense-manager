import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../connection'
import { categories, sources } from '../schema'
import { DEFAULT_CATEGORY_SOURCES } from '../seed/defaultCategorySources'

export interface ImportResult {
  categoriesCreated: number
  sourcesCreated: number
  categoriesSkipped: number
  sourcesSkipped: number
}

/**
 * Idempotently imports the default Category and Source dataset for the given account.
 * Reuses existing categories/sources, creates missing ones, and links Source.category_id = Category.id.
 */
export function importCategorySources(db: AppDatabase, accountId: number): ImportResult {
  const result: ImportResult = {
    categoriesCreated: 0,
    sourcesCreated: 0,
    categoriesSkipped: 0,
    sourcesSkipped: 0
  }

  db.transaction((tx) => {
    // 1. Fetch all existing categories for this account
    const existingCategories = tx
      .select()
      .from(categories)
      .where(eq(categories.accountId, accountId))
      .all()

    // 2. Fetch all existing sources for this account
    const existingSources = tx
      .select()
      .from(sources)
      .where(eq(sources.accountId, accountId))
      .all()

    for (const item of DEFAULT_CATEGORY_SOURCES) {
      const targetCatName = item.category.name.trim().toLowerCase()
      let category = existingCategories.find(c => c.name.trim().toLowerCase() === targetCatName)

      if (category) {
        result.categoriesSkipped++
      } else {
        const inserted = tx
          .insert(categories)
          .values({
            accountId,
            name: item.category.name.trim(),
            icon: item.category.icon,
            color: item.category.color,
            description: item.category.description || null
          })
          .returning()
          .get()

        category = inserted
        existingCategories.push(category)
        result.categoriesCreated++
      }

      const categoryId = category.id

      for (const sourceName of item.sources) {
        const targetSourceName = sourceName.trim().toLowerCase()
        const sourceExists = existingSources.some(
          s => s.categoryId === categoryId && s.name.trim().toLowerCase() === targetSourceName
        )

        if (sourceExists) {
          result.sourcesSkipped++
        } else {
          const inserted = tx
            .insert(sources)
            .values({
              accountId,
              categoryId,
              name: sourceName.trim(),
              isActive: true,
              description: null
            })
            .returning()
            .get()

          existingSources.push(inserted)
          result.sourcesCreated++
        }
      }
    }
  })

  return result
}
