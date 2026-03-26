import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export interface Card {
  id: string
  deck_id: string
  question: string
  answer: string
  next_review: string
  interval: number
  mode: 'flip' | 'type'
  created_at: string
}

export function useCards(deckId: string) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCards()
  }, [deckId])

  async function loadCards() {
    setLoading(true)
    const { data } = await supabase
      .from('cards')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: false })
    setCards(data || [])
    setLoading(false)
  }

  async function createCard(question: string, answer: string, mode: 'flip' | 'type' = 'flip'): Promise<string | null> {
    const { error } = await supabase
      .from('cards')
      .insert({ question, answer, deck_id: deckId, mode })
    if (error) return error.message
    await loadCards()
    return null
  }

  async function deleteCard(id: string): Promise<void> {
    await supabase.from('cards').delete().eq('id', id)
    await loadCards()
  }

  async function updateCard(id: string, question: string, answer: string, mode: 'flip' | 'type' = 'flip'): Promise<void> {
    await supabase.from('cards').update({ question, answer, mode }).eq('id', id)
    await loadCards()
  }

  return { cards, loading, createCard, deleteCard, updateCard }
}