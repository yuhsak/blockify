import { useState } from 'react'
import { GenerateCurlCommandForm } from './components/composite/generate-curl-command-form'
import { Textarea } from './components/ui/textarea'
import { Button } from './components/ui/button'
import { useToast } from '@/components/ui/use-toast'

function App() {
  const [curlCmd, setCurlCmd] = useState('')
  const { toast } = useToast()

  const handleGenerate = (curlCmd: string) => {
    setCurlCmd(curlCmd)
    toast({
      title: 'Generated!',
      duration: 1000,
    })
  }

  const handleClickCopy = () => {
    const textarea: HTMLTextAreaElement | null = document.querySelector('textarea#curl-command')
    if (textarea) {
      textarea.select()
      document.execCommand('copy')
      textarea.selectionEnd = 0
      textarea.blur()
      toast({
        title: 'Copied!',
        duration: 1000,
      })
    }
  }

  return (
    <main className='max-w-xl mx-auto px-6 py-6 space-y-8'>
      <div className='space-y-2'>
        <h1 className='text-4xl font-bold'>Blockify</h1>
        <p className='text-muted-foreground'>Post to slack with Block Kit.</p>
      </div>
      <GenerateCurlCommandForm onGenerate={handleGenerate} />
      <hr />
      <Textarea
        id='curl-command'
        className='h-96'
        readOnly
        placeholder='Generated curl command will appear here.'
        value={curlCmd}
      />
      <div className='flex flex-row justify-end'>
        <Button size={'lg'} onClick={handleClickCopy}>
          Copy
        </Button>
      </div>
    </main>
  )
}

export { App }
