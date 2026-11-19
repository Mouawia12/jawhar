// Types are generated into @jawhar/shared (with `declare: false`) so that clients can
// import them without depending on Payload. This re-attaches them to Payload here.
import type { Config } from '@jawhar/shared/payload-types'

declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}
