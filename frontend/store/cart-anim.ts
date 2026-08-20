import { create } from "zustand"

interface Fly {
  id: number
  x: number
  y: number
  name: string
}

interface CartAnimState {
  flies: Fly[]
  trigger: (name: string, x: number, y: number) => void
  remove: (id: number) => void
}

let nextId = 0

export const useCartAnimStore = create<CartAnimState>((set) => ({
  flies: [],
  trigger: (name, x, y) => {
    const id = ++nextId
    set((s) => ({ flies: [...s.flies, { id, x, y, name }] }))
    setTimeout(() => set((s) => ({ flies: s.flies.filter((f) => f.id !== id) })), 900)
  },
  remove: (id) => set((s) => ({ flies: s.flies.filter((f) => f.id !== id) })),
}))
