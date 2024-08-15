import { forwardRef, type ComponentPropsWithoutRef } from 'react'
import { useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import * as v from 'valibot'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { json, isSlackBlockKit } from '@/lib/valibot'

const formSchema = v.object({
  token: v.pipe(v.string(), v.regex(/^xoxc\-/, 'Token is something like "xoxc-xxxxxxx".')),
  cookie: v.pipe(v.string(), v.regex(/^xoxd\-/, 'Cookie is something like "xoxd-xxxxxxx".')),
  channelId: v.pipe(v.string(), v.nonEmpty('Channel ID must be specified.')),
  threadTs: v.string(),
  blocks: v.pipe(
    v.string(),
    v.nonEmpty('Blocks must be specified.'),
    json('Failed to parse as JSON.'),
    v.transform(JSON.parse),
    isSlackBlockKit('Not a valid block kit schema.'),
    v.transform(JSON.stringify),
  ),
})

type FormSchema = v.InferOutput<typeof formSchema>

const placeholder = JSON.stringify(
  {
    blocks: [
      {
        type: 'rich_text',
        elements: [
          {
            type: 'rich_text_section',
            elements: [
              {
                type: 'text',
                text: 'example post',
              },
            ],
          },
        ],
      },
    ],
  },
  null,
  4,
)
const extractTs = (ts: string) => {
  const a = ts.replace(/^p/, '')
  if (a.includes('.')) return a
  const b = a.slice(0, 10)
  const c = a.slice(10)
  return `${b}.${c}`
}

const generateCurlCmd = (params: FormSchema) => {
  const exec = `curl`
  const method = `--request POST`
  const url = `--url https://app.slack.com/api/chat.postMessage`
  const header = `--header 'Content-Type: multipart/form-data'`
  const cookie = `--cookie d=${params.cookie}`
  const blocksObj = JSON.parse(params.blocks)
  const blocks = JSON.stringify(blocksObj.blocks)
    .split("'")
    .map((item) => `'${item}'`)
    .join("\\'")
  const forms = [
    `--form token=${params.token}`,
    `--form channel=${params.channelId}`,
    `--form type=message`,
    `--form blocks=${blocks}`,
    ...(params.threadTs ? [`--form thread_ts=${extractTs(params.threadTs)}`] : []),
  ]
  const cmd = [exec, method, url, header, cookie, ...forms].join(' \\\n\t')
  return cmd
}

export type GenerateCurlCommandFormProps = Omit<
  ComponentPropsWithoutRef<'form'>,
  'children' | 'onSubmit'
> & {
  onGenerate?: (curlCommand: string) => void
}

export const GenerateCurlCommandForm = forwardRef<HTMLFormElement, GenerateCurlCommandFormProps>(
  ({ className, onGenerate, ...props }, ref) => {
    const form = useForm<FormSchema>({
      resolver: valibotResolver(formSchema),
      defaultValues: {
        token: '',
        cookie: '',
        channelId: '',
        threadTs: '',
        blocks: '',
      },
    })

    const onSubmit = async (values: FormSchema) => {
      onGenerate?.(generateCurlCmd(values))
    }

    return (
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={cn('space-y-8', className)}
          {...props}
          ref={ref}
        >
          <FormField
            control={form.control}
            name='token'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Token</FormLabel>
                  <FormControl>
                    <Input placeholder='xoxc-...' {...field} />
                  </FormControl>
                  <FormDescription>Workspace token.</FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name='cookie'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Cookie</FormLabel>
                  <FormControl>
                    <Input placeholder='xoxd-...' {...field} />
                  </FormControl>
                  <FormDescription>Cookie token.</FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name='channelId'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Channel ID</FormLabel>
                  <FormControl>
                    <Input placeholder='C01ABCDEFGH' {...field} />
                  </FormControl>
                  <FormDescription>Channel ID of the posting destination.</FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name='threadTs'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Thread timestamp</FormLabel>
                  <FormControl>
                    <Input placeholder='p1723514345490399' {...field} />
                  </FormControl>
                  <FormDescription>
                    (Optional) Timestamp of the original thread when posting as a reply.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <FormField
            control={form.control}
            name='blocks'
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel>Blocks</FormLabel>
                  <FormControl>
                    <Textarea placeholder={placeholder} className='h-80' {...field} />
                  </FormControl>
                  <FormDescription>Json string of blocks.</FormDescription>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
          <div className='flex flex-row justify-end'>
            <Button type='submit' size='lg'>
              Generate curl
            </Button>
          </div>
        </form>
      </Form>
    )
  },
)
