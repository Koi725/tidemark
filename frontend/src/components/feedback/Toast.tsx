import { Toaster as SonnerToaster } from 'sonner'

/** Toast region host (§3.32). Mounted once in the root layout. `notify` lives in ./notify. */
export function Toaster(): React.JSX.Element {
  return (
    <SonnerToaster
      position="bottom-right"
      mobileOffset={{ bottom: '76px' }}
      offset={{ bottom: '16px' }}
      visibleToasts={3}
      toastOptions={{ unstyled: true, classNames: { toast: 'w-full' } }}
    />
  )
}
