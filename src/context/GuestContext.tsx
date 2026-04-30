import { createContext, useContext, useState } from 'react'

interface GuestContextType {
  guestMode: boolean
  enableGuestMode: () => void
  disableGuestMode: () => void
}

const GuestContext = createContext<GuestContextType>({
  guestMode: false,
  enableGuestMode: () => {},
  disableGuestMode: () => {},
})

export function GuestProvider({ children }: { children: React.ReactNode }) {
  const [guestMode, setGuestMode] = useState(false)
  return (
    <GuestContext.Provider value={{
      guestMode,
      enableGuestMode: () => setGuestMode(true),
      disableGuestMode: () => setGuestMode(false),
    }}>
      {children}
    </GuestContext.Provider>
  )
}

export const useGuest = () => useContext(GuestContext)
