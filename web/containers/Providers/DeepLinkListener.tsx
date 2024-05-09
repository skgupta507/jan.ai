import { Fragment, ReactNode } from 'react'

import { useSetAtom } from 'jotai'

import { useDebouncedCallback } from 'use-debounce'

import { useGetHFRepoData } from '@/hooks/useGetHFRepoData'

import { toaster } from '../Toast'

import {
  importHuggingFaceModelStageAtom,
  importingHuggingFaceRepoDataAtom,
} from '@/helpers/atoms/HuggingFace.atom'
type Props = {
  children: ReactNode
}

const DeepLinkListener: React.FC<Props> = ({ children }) => {
  const { getHfRepoData } = useGetHFRepoData()
  const setImportingHuggingFaceRepoData = useSetAtom(
    importingHuggingFaceRepoDataAtom
  )
  const setImportHuggingFaceModelStage = useSetAtom(
    importHuggingFaceModelStageAtom
  )

  const debounced = useDebouncedCallback(async (searchText) => {
    if (searchText.indexOf('/') === -1) {
      // If we don't find / in the text, perform a local search
      return
    }

    try {
      const data = await getHfRepoData(searchText)
      setImportingHuggingFaceRepoData(data)
      setImportHuggingFaceModelStage('REPO_DETAIL')
    } catch (err) {
      let errMessage = 'Unexpected Error'
      if (err instanceof Error) {
        errMessage = err.message
      }
      toaster({
        title: 'Failed to get Hugging Face models',
        description: errMessage,
        type: 'error',
      })
      console.error(err)
    }
  }, 300)
  window.electronAPI?.onDeepLink((_event: string, input: string) => {
    // console.log('DeepLinkListener', _event)
    console.log('DeepLinkListener', input)
    // electron-fiddle://open
    // testing
    const url = input.replaceAll('electron-fiddle://', '')
    debounced(url)
  })

  return <Fragment>{children}</Fragment>
}

export default DeepLinkListener
