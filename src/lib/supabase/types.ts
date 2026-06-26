export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type StatutCommande = 'nouveau' | 'confirme' | 'en_preparation' | 'en_livraison' | 'livre' | 'annule'
export type ModePaiement = 'wave' | 'orange_money' | 'cash'
export type StatutPaiement = 'en_attente' | 'recu' | 'echoue'

export interface Database {
  public: {
    Tables: {
      restaurants: {
        Row: {
          id: string
          nom: string
          adresse: string | null
          specialite: string | null
          contact: string | null
          horaires: string | null
          actif: boolean
          fiabilite: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['restaurants']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['restaurants']['Insert']>
      }
      plats: {
        Row: {
          id: string
          restaurant_id: string
          nom: string
          description: string | null
          prix: number
          disponible: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['plats']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['plats']['Insert']>
      }
      livreurs: {
        Row: {
          id: string
          nom: string
          telephone: string
          moto: string | null
          disponible: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['livreurs']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['livreurs']['Insert']>
      }
      commandes: {
        Row: {
          id: string
          numero: string
          client_nom: string | null
          client_telephone: string | null
          client_adresse: string | null
          client_geoloc: string | null
          restaurant_id: string | null
          plat_id: string | null
          plat_nom: string
          plat_prix: number
          details_plat: string | null
          livreur_id: string | null
          frais_livraison: number
          statut: StatutCommande
          mode_paiement: ModePaiement
          statut_paiement: StatutPaiement
          montant_total: number
          notes: string | null
          created_at: string
          updated_at: string
          livre_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['commandes']['Row'], 'id' | 'numero' | 'montant_total' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['commandes']['Insert']>
      }
    }
  }
}

// Types utilitaires
export type Restaurant = Database['public']['Tables']['restaurants']['Row']
export type Plat = Database['public']['Tables']['plats']['Row']
export type Livreur = Database['public']['Tables']['livreurs']['Row']
export type Commande = Database['public']['Tables']['commandes']['Row']

export type CommandeAvecRelations = Commande & {
  restaurants?: Pick<Restaurant, 'nom'> | null
  livreurs?: Pick<Livreur, 'nom' | 'telephone'> | null
  plats?: Pick<Plat, 'nom'> | null
}

export const STATUT_LABELS: Record<StatutCommande, string> = {
  nouveau: 'Nouveau',
  confirme: 'Confirmé',
  en_preparation: 'En préparation',
  en_livraison: 'En livraison',
  livre: 'Livré',
  annule: 'Annulé',
}

export const STATUT_COLORS: Record<StatutCommande, string> = {
  nouveau: 'bg-blue-100 text-blue-800',
  confirme: 'bg-yellow-100 text-yellow-800',
  en_preparation: 'bg-orange-100 text-orange-800',
  en_livraison: 'bg-purple-100 text-purple-800',
  livre: 'bg-green-100 text-green-800',
  annule: 'bg-red-100 text-red-800',
}

export const PAIEMENT_LABELS: Record<ModePaiement, string> = {
  wave: 'Wave',
  orange_money: 'Orange Money',
  cash: 'Cash à la livraison',
}
