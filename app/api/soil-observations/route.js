import { supabase } from '@/lib/supabase'

// GET - Fetch soil observations for a field
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')
    const limit = searchParams.get('limit') || '10'

    if (!fieldId) {
      return Response.json({ error: 'fieldId required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('field_observations')
      .select('*')
      .eq('field_id', fieldId)
      .order('observation_date', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    return Response.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching observations:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// POST - Create a new soil observation
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      fieldId,
      observationType = 'soil_health',
      color,
      texture,
      drainage,
      organicMatter,
      compaction,
      earthwormLevel,
      surfaceCrust,
      notes,
      calculatedScore
    } = body

    if (!fieldId) {
      return Response.json(
        { error: 'fieldId, and soil observation data required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('field_observations')
      .insert([
        {
          field_id: fieldId,
          observation_type: observationType,
          color,
          texture,
          drainage,
          organic_matter: organicMatter,
          compaction,
          earthworm_level: earthwormLevel,
          surface_crust: surfaceCrust,
          notes,
          calculated_score: calculatedScore,
          data_source: 'manual_observation'
        }
      ])
      .select()

    if (error) throw error

    return Response.json(
      { data: data[0], success: true, message: 'Observation saved' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating observation:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
