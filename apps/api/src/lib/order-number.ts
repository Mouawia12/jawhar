import { randomBytes, randomInt } from 'node:crypto'

/** Random, phone-friendly order numbers (JW-482913). They don't reveal sales volume. */
export const generateOrderNumber = () => `JW-${randomInt(100000, 1000000)}`

/** Secret that lets the customer (and only them) view their order summary. */
export const generateAccessToken = () => randomBytes(18).toString('base64url')
