// lib/matching.js
import { supabase } from './supabase'

export async function beregnMatchScore(bruker1, bruker2) {
  // Enkel matching algoritme basert på felles verdier
  const fellesVerdier = bruker1.verdier.filter(verdi => 
    bruker2.verdier.includes(verdi)
  )
  
  const totalVerdier = [...new Set([...bruker1.verdier, ...bruker2.verdier])]
  const score = fellesVerdier.length / totalVerdier.length
  
  // Bonuspoeng for samme by
  const byBonus = bruker1.by === bruker2.by ? 0.1 : 0
  
  // Bonuspoeng for kompatibel alder (±5 år)
  const alderDiff = Math.abs(bruker1.alder - bruker2.alder)
  const alderBonus = alderDiff <= 5 ? 0.1 : 0
  
  return Math.min(score + byBonus + alderBonus, 1)
}

export async function hentDagensMatches(brukerId) {
  const idag = new Date().toISOString().split('T')[0]
  
  // Sjekk om bruker allerede har fått dagens match
  const { data: eksisterendeMatch } = await supabase
    .from('matches')
    .select('*')
    .or(`bruker1_id.eq.${brukerId},bruker2_id.eq.${brukerId}`)
    .eq('match_dato', idag)
  
  if (eksisterendeMatch && eksisterendeMatch.length > 0) {
    return eksisterendeMatch
  }

  // Hent brukerens profil
  const { data: brukerProfil } = await supabase
    .from('brukere')
    .select('*')
    .eq('id', brukerId)
    .single()

  // Hent alle andre aktive brukere
  const { data: andreBrukere } = await supabase
    .from('brukere')
    .select('*')
    .neq('id', brukerId)
    .eq('aktiv', true)

  if (!andreBrukere || andreBrukere.length === 0) {
    return []
  }

  // Beregn scores og finn beste match
  const matchesWithScores = andreBrukere.map(bruker => ({
    ...bruker,
    score: beregnMatchScore(brukerProfil, bruker)
  }))

  // Sorter etter score og velg topp 3
  const topMatches = matchesWithScores
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  // Opprett matches i database
  const nyeMatches = []
  for (const match of topMatches) {
    const { data } = await supabase
      .from('matches')
      .insert([{
        bruker1_id: brukerId,
        bruker2_id: match.id,
        match_dato: idag
      }])
      .select()
    
    nyeMatches.push(...data)
  }

  return nyeMatches
}

export async function registrerInteresse(matchId, brukerId, interesse) {
  const { data: match } = await supabase
    .from('matches')
    .select('*')
    .eq('id', matchId)
    .single()

  const kolonne = match.bruker1_id === brukerId ? 'interesse_bruker1' : 'interesse_bruker2'

  const { data, error } = await supabase
    .from('matches')
    .update({ [kolonne]: interesse })
    .eq('id', matchId)
    .select()

  if (error) throw error
  return data[0]
}

// Add alias for backward compatibility
export { beregnMatchScore as calculateCompatibility }