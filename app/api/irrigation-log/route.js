import { supabase } from '@/lib/supabase'

// GET - Fetch irrigation logs for a field
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const fieldId = searchParams.get('fieldId')
    const limit = searchParams.get('limit') || '20'

    if (!fieldId) {
      return Response.json({ error: 'fieldId required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('irrigation_log')
      .select('*')
      .eq('field_id', fieldId)
      .order('irrigated_date', { ascending: false })
      .limit(parseInt(limit))

    if (error) throw error

    return Response.json({ data, success: true })
  } catch (error) {
    console.error('Error fetching irrigation logs:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// POST - Log an irrigation event
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      fieldId,
      waterUsedLiters,
      method,
      durationHours,
      pressureBar,
      notes
    } = body

    if (!fieldId || !waterUsedLiters || !method) {
      return Response.json(
        { error: 'fieldId, waterUsedLiters, and method required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('irrigation_log')
      .insert([
        {
          field_id: fieldId,
          water_used_liters: waterUsedLiters,
          method,
          duration_hours: durationHours,
          pressure_bar: pressureBar,
          notes: notes || 'Logged manually'
        }
      ])
      .select()

    if (error) throw error

    return Response.json(
      { data: data[0], success: true, message: 'Irrigation logged' },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error logging irrigation:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}

// PUT - Update an irrigation log
export async function PUT(request) {
  try {
    const body = await request.json()
    const { id, waterUsedLiters, method, durationHours, notes } = body

    if (!id) {
      return Response.json({ error: 'id required for update' }, { status: 400 })
    }

    const updateData = {}
    if (waterUsedLiters !== undefined) updateData.water_used_liters = waterUsedLiters
    if (method !== undefined) updateData.method = method
    if (durationHours !== undefined) updateData.duration_hours = durationHours
    if (notes !== undefined) updateData.notes = notes

    const { data, error } = await supabase
      .from('irrigation_log')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) throw error

    return Response.json(
      { data: data[0], success: true, message: 'Irrigation updated' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating irrigation log:', error)
    return Response.json({ error: error.message }, { status: 500 })
  }
}
