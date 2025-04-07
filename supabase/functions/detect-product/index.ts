import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'npm:@supabase/supabase-js'
import Vision from 'npm:@google-cloud/vision@4.0.2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { image } = await req.json()
    
    // Initialize Vision client
    const vision = new Vision.ImageAnnotatorClient()
    
    // Perform label detection
    const [result] = await vision.labelDetection(image)
    const labels = result.labelAnnotations

    // Check if any labels match American brands
    const americanBrands = ['coca-cola', 'pepsi', 'kraft', 'campbell']
    const isAmerican = labels.some(label => 
      americanBrands.some(brand => 
        label.description.toLowerCase().includes(brand)
      )
    )

    return new Response(
      JSON.stringify({ isAmerican, labels }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    )
  }
})