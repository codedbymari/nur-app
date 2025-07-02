import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { getCurrentUTCDateTime } from '@/utils/dateTime'

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('soknad')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({
      success: true,
      data: data
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch applications',
        details: error.message 
      },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    console.log('API Route - Received data:', data)
    console.log('API Route - Data types:', Object.entries(data).map(([key, value]) => 
      `${key}: ${typeof value} ${Array.isArray(value) ? '(array)' : ''}`
    ))
    
    // Insert into Supabase
    const { data: result, error } = await supabase
      .from('soknad')
      .insert(data)
      .select()
    
    if (error) {
      console.error('Supabase error details:', {
        message: error.message,
        code: error.code,
        hint: error.hint,
        details: error.details
      })
      
      return NextResponse.json(
        { 
          success: false,
          error: 'Database error', 
          details: error.message,
          hint: error.hint || 'Check data types and table schema'
        }, 
        { status: 400 }
      )
    }
    
    console.log('API Route - Success:', result)
    return NextResponse.json({ 
      success: true, 
      data: result 
    })
    
  } catch (error) {
    console.error('API Route - Server error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Server error',
        details: error.message 
      }, 
      { status: 500 }
    )
  }
}

export async function PATCH(request) {
  try {
    const body = await request.json()
    const { id, status } = body

    console.log('API Route PATCH - Received:', { id, status })

    if (!id || !status) {
      return NextResponse.json(
        { 
          success: false,
          error: 'ID and status are required' 
        },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['pending', 'godkjent', 'avslatt']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Invalid status value. Must be: pending, godkjent, or avslatt' 
        },
        { status: 400 }
      )
    }

    const currentDateTime = getCurrentUTCDateTime()
    
    const { data, error } = await supabase
      .from('soknad')
      .update({ 
        status: status,
        updated_at: currentDateTime
      })
      .eq('id', id)
      .select()

    if (error) {
      console.error('Supabase update error:', error)
      throw error
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: 'Application not found' 
        },
        { status: 404 }
      )
    }

    console.log('API Route PATCH - Success:', data[0])
    
    return NextResponse.json({
      success: true,
      data: data[0]
    })

  } catch (error) {
    console.error('API Route PATCH - Error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update application status',
        details: error.message 
      },
      { status: 500 }
    )
  }
}