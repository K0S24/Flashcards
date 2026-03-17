import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Deck {
  id: string
  user_id: string
  name: string
  description: string
  created_at: string
}

export function useDecks(userId: string) {
  const [decks, setDecks] = useState<Deck[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDecks()
  }, [userId])

  async function loadDecks() {
    setLoading(true)
    const { data } = await supabase
      .from('decks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    setDecks(data || [])
    setLoading(false)
  }

  async function createDeck(name: string, description: string): Promise<string | null> {
    const { error } = await supabase
      .from('decks')
      .insert({ name, description, user_id: userId })
    if (error) return error.message
    await loadDecks()
    return null
  }

  async function deleteDeck(id: string): Promise<void> {
    await supabase.from('decks').delete().eq('id', id)
    await loadDecks()
  }

  return { decks, loading, createDeck, deleteDeck }
}