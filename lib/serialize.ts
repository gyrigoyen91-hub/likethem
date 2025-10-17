/**
 * Serialization utility for Prisma data
 * Handles BigInt and Decimal serialization issues
 */
export function serializePrisma<T>(input: T): T {
  return JSON.parse(JSON.stringify(input, (_key, value) => {
    if (typeof value === 'bigint') return value.toString()
    if (value && typeof value === 'object' && '_isDecimal' in value) {
      return Number(value) // Prisma.Decimal -> number
    }
    return value
  }))
}
