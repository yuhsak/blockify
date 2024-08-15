import { pipe, string, object, array, record, unknown, check, safeParse } from 'valibot'

const boolify = <T extends unknown[], U>(fn: (...args: T) => U) => {
  return (...args: T): boolean => {
    try {
      fn(...args)
    } catch (e) {
      return false
    }
    return true
  }
}

export const json = (message?: string | undefined) => {
  return check<string, string | undefined>(boolify(JSON.parse), message)
}

export const jsonValue = (message?: string | undefined) => {
  return check<unknown, string | undefined>(boolify(JSON.stringify), message)
}

export const SlackBlockKitSchema = object({
  blocks: array(record(string(), pipe(unknown(), jsonValue()))),
})

export const isSlackBlockKit = (message?: string | undefined) => {
  return check<unknown, string | undefined>((input) => {
    return safeParse(SlackBlockKitSchema, input).success
  }, message)
}
