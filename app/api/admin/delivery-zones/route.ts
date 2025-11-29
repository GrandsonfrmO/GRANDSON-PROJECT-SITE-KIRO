import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3001';
const ZONES_FILE = path.join(process.cwd(), 'delivery-zones.json');

// Lire les zones
function readZones() {
  try {
    if (fs.existsSync(ZONES_FILE)) {
      const data = fs.readFileSync(ZONES_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error reading zones');
  }
  return [];
}

// Sauvegarder les zones
function saveZones(zones: any[]) {
  try {
    fs.writeFileSync(ZONES_FILE, JSON.stringify(zones, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving zones:', error);
    return false;
  }
}

// GET - Récupérer toutes les zones
export async function GET(request: NextRequest) {
  try {
    // Essayer le backend d'abord
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/delivery-zones`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || ''
        },
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend not available, using local storage');
    }

    // Mode local
    const zones = readZones();
    return NextResponse.json({ success: true, data: zones });
  } catch (error) {
    console.error('Error fetching delivery zones:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle zone
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Essayer le backend d'abord
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/delivery-zones`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || ''
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000)
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json(data);
      }
    } catch (backendError) {
      console.log('Backend not available, using local storage');
    }

    // Mode local
    const zones = readZones();
    const newZone = {
      id: Date.now().toString(),
      name: body.name,
      price: body.price,
      estimatedDays: body.estimatedDays,
      isActive: body.isActive ?? true
    };
    
    zones.push(newZone);
    saveZones(zones);
    
    return NextResponse.json({ success: true, data: newZone });
  } catch (error) {
    console.error('Error creating delivery zone:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    );
  }
}
