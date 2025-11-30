import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';

// Fichier pour stocker les zones en mode démo
const ZONES_FILE = path.join(process.cwd(), 'delivery-zones.json');

// Données de démonstration initiales
const defaultZones = [
  {
    id: '1',
    name: 'Conakry Centre',
    price: 5000,
    estimatedDays: '1-2 jours',
    isActive: true
  },
  {
    id: '2', 
    name: 'Conakry Banlieue',
    price: 8000,
    estimatedDays: '2-3 jours',
    isActive: true
  },
  {
    id: '3',
    name: 'Intérieur du pays',
    price: 15000,
    estimatedDays: '3-5 jours',
    isActive: true
  }
];

// Lire les zones depuis le fichier
function readZones() {
  try {
    if (fs.existsSync(ZONES_FILE)) {
      const data = fs.readFileSync(ZONES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Using default zones');
  }
  return defaultZones;
}

// Sauvegarder les zones dans le fichier
function saveZones(zones: any[]) {
  try {
    fs.writeFileSync(ZONES_FILE, JSON.stringify(zones, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving zones:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🚚 Frontend API: Fetching delivery zones...');
    
    // Essayer de se connecter au backend d'abord
    try {
      const response = await fetch(`${BACKEND_URL}/api/delivery-zones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(2000)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Delivery zones fetched from backend');
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend not available, using local data');
    }
    
    // Utiliser les données locales
    const zones = readZones();
    console.log('✅ Using local delivery zones');
    
    return NextResponse.json({
      success: true,
      data: zones
    });
  } catch (error) {
    console.error('❌ Frontend API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Erreur lors de la récupération des zones de livraison'
        }
      },
      { status: 500 }
    );
  }
}