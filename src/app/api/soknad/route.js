import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  return NextResponse.json({ message: 'Soknad API endpoint' })
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