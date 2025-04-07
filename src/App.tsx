import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Webcam from 'react-webcam';
import { motion } from 'framer-motion';
import { Camera, DollarSign, Package, RefreshCw } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Mock data to use when Supabase is not configured
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'American Cola',
    description: 'Classic American cola drink',
    price: 2.99,
    image_url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=2070',
    is_american: true,
    alternative_to: null,
  },
  {
    id: '2',
    name: 'Local Fizz',
    description: 'Local alternative cola drink',
    price: 1.99,
    image_url: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?auto=format&fit=crop&q=80&w=1974',
    is_american: false,
    alternative_to: '1',
  },
];

let supabase: any = null;

// Only initialize Supabase if credentials are available
if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY) {
  supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  is_american: boolean;
  alternative_to: string | null;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [savings, setSavings] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    if (!supabase) {
      // Use mock data if Supabase is not configured
      setProducts(MOCK_PRODUCTS);
      toast.info('Using demo data - Supabase credentials not configured');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
      
      if (error) {
        throw error;
      }
      
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      // Fallback to mock data
      setProducts(MOCK_PRODUCTS);
    }
  };

  const handleCapture = async (imageSrc: string | null) => {
    if (!imageSrc) return;

    setScanning(true);
    try {
      if (!supabase) {
        // Mock response for demo
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
        toast.success('Demo Mode: Simulating product detection');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/detect-product`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      const { isAmerican } = await response.json();

      if (isAmerican) {
        toast.success('American product detected! Showing alternatives...');
        // Logic to filter and show alternatives
      } else {
        toast.info('No American product detected');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      toast.error('Failed to analyze image');
    } finally {
      setScanning(false);
      setShowCamera(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-purple-800">AlternativeFinder</h1>
          <motion.div
            className="flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full"
            whileHover={{ scale: 1.05 }}
          >
            <DollarSign className="text-green-600" />
            <span className="font-semibold text-green-800">
              Saved: ${savings.toFixed(2)}
            </span>
          </motion.div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 pt-24 pb-12">
        {/* Camera Button */}
        <motion.button
          className="fixed bottom-8 right-8 bg-purple-600 text-white p-4 rounded-full shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowCamera(true)}
        >
          <Camera size={24} />
        </motion.button>

        {/* Camera Modal */}
        {showCamera && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-4 rounded-lg shadow-xl"
            >
              <Webcam
                audio={false}
                screenshotFormat="image/jpeg"
                className="rounded"
                onUserMedia={() => toast.success('Camera ready!')}
              />
              <div className="flex justify-center gap-4 mt-4">
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={() => setShowCamera(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
                  onClick={() => handleCapture(null)}
                  disabled={scanning}
                >
                  {scanning ? (
                    <RefreshCw className="animate-spin" />
                  ) : (
                    <Camera />
                  )}
                  Capture
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-gray-600 mt-1">{product.description}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-purple-600 font-bold">
                    ${product.price}
                  </span>
                  {product.is_american ? (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-sm">
                      American Product
                    </span>
                  ) : (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                      Alternative
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;