import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { CONFIG } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_nom,
      client_telephone,
      client_adresse,
      client_geoloc,
      restaurant_id,
      plat_id,
      plat_nom,
      plat_prix,
      details_plat,
      livreur_id,
      mode_paiement,
      notes,
    } = body

    if (!plat_nom || !plat_prix) {
      return NextResponse.json({ error: 'plat_nom et plat_prix sont requis' }, { status: 400 })
    }

    const supabase = createClient()

    // Insertion sans .select().single()
    const { data: insertedData, error } = await supabase
      .from('commandes')
      .insert({
        client_nom,
        client_telephone,
        client_adresse,
        client_geoloc,
        restaurant_id: restaurant_id || null,
        plat_id: plat_id || null,
        plat_nom,
        plat_prix: parseInt(plat_prix),
        details_plat,
        livreur_id: livreur_id || null,
        mode_paiement: mode_paiement || 'cash',
        frais_livraison: CONFIG.FRAIS_LIVRAISON,
        statut: 'nouveau',
        notes,
      })
      .select() // On garde le select mais sans .single()

    if (error) {
      console.error('Erreur création commande:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Vérifier si on a bien des données
    if (!insertedData || insertedData.length === 0) {
      return NextResponse.json({ error: 'Erreur lors de la création' }, { status: 500 })
    }

    // Récupérer la commande créée avec les relations
    const { data: commande, error: selectError } = await supabase
      .from('commandes')
      .select('*, restaurants(nom), livreurs(nom, telephone)')
      .eq('id', insertedData[0].id)
      .single()

    if (selectError) {
      console.error('Erreur récupération commande:', selectError)
      // On retourne quand même la commande sans les relations
      return NextResponse.json({ data: insertedData[0] }, { status: 201 })
    }

    return NextResponse.json({ data: commande }, { status: 201 })
  } catch (err: any) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const { searchParams } = new URL(request.url)
    const statut = searchParams.get('statut')
    const date = searchParams.get('date')

    let query = supabase
      .from('commandes')
      .select('*, restaurants(nom), livreurs(nom, telephone)')
      .order('created_at', { ascending: false })

    if (statut) query = query.eq('statut', statut)
    if (date) {
      const start = new Date(date)
      start.setHours(0, 0, 0, 0)
      const end = new Date(date)
      end.setHours(23, 59, 59, 999)
      query = query.gte('created_at', start.toISOString()).lte('created_at', end.toISOString())
    }

    const { data, error } = await query.limit(200)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ data })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}