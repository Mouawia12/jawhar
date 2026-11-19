import type { Category } from '@jawhar/shared/payload-types'
import { Fragment } from 'react'

import { Lozenge } from './ornaments'

/**
 * An embroidered ribbon carrying the names of the crafts. It slides with the scroll
 * (see .band-track). Decorative: the same names are listed as real links just below.
 */
export function CraftBand({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null
  const run = Array.from({ length: 4 }, () => categories.map((c) => c.title)).flat()
  return (
    <div data-drift aria-hidden="true" className="mt-16 overflow-hidden bg-ink text-ivory md:mt-24">
      <div className="stitch mt-2.5" />
      <div className="flex justify-center py-3 md:py-4">
        <div className="band-track flex w-max shrink-0 items-center gap-6 md:gap-10">
          {run.map((name, i) => (
            <Fragment key={i}>
              <span className="display whitespace-nowrap text-3xl md:text-5xl">{name}</span>
              <Lozenge className="h-6 w-6 shrink-0 text-gold md:h-8 md:w-8" />
            </Fragment>
          ))}
        </div>
      </div>
      <div className="stitch mb-2.5" />
    </div>
  )
}
