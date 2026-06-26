import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const updateData: Record<string, unknown> = {}

    if (body.statut) {
      updateData.statut = body.statut
      if (body.statut === 'livre') {
        updateData.livre_at = new Date().toISOString()
      }
    }
    if (body.statut_paiement) updateData.statut_paiement = body.statut_paiement
    if (body.livreur_id !== undefined) updateData.livreur_id = body.livreur_id
    if (body.notes !== undefined) updateData.notes = body.notes

    // Mise à jour sans .select().single()
    const { error: updateError } = await supabase
      .from('commandes')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    // Récupérer la commande mise à jour avec les relations
    const { data, error: selectError } = await supabase
      .from('commandes')
      .select('*, restaurants(nom), livreurs(nom, telephone)')
      .eq('id', params.id)
      .single()

    if (selectError) {
      return NextResponse.json({ error: selectError.message }, { status: 500 })
    }

    return NextResponse.json({ data })
  } catch (err: any) {
    console.error('Erreur serveur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

// Ajoutez aussi un DELETE si nécessaire
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}