import type { Access, FieldAccess } from 'payload'

/** Any signed-in admin user. The public API never authenticates. */
export const isAdmin: Access = ({ req }) => Boolean(req.user)
export const isAdminField: FieldAccess = ({ req }) => Boolean(req.user)

export const anyone: Access = () => true

/** Public visitors only ever see published documents. */
export const publishedOrAdmin: Access = ({ req }) =>
  req.user ? true : { status: { equals: 'published' } }
