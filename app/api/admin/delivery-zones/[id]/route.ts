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

// PUT - Modifier une zone
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const body = await request.json();
    
    // Essayer le backend d'abord
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/delivery-zones/${id}`, {
        method: 'PUT',
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
    const zoneIndex = zones.findIndex((z: any) => z.id === id);
    
    if (zoneIndex === -1) {
      return NextResponse.json(
        { success: false, error: 'Zone non trouvée' },
        { status: 404 }
      );
    }
    
    zones[zoneIndex] = {
      ...zones[zoneIndex],
      ...body,
      id: id
    };
    
    saveZones(zones);
    
    return NextResponse.json({ success: true, data: zones[zoneIndex] });
  } catch (error) {
    console.error('Error updating delivery zone:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une zone
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    // Essayer le backend d'abord
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/delivery-zones/${id}`, {
        method: 'DELETE',
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
    const filteredZones = zones.filter((z: any) => z.id !== id);
    
    if (zones.length === filteredZones.length) {
      return NextResponse.json(
        { success: false, error: 'Zone non trouvée' },
        { status: 404 }
      );
    }
    
    saveZones(filteredZones);
    
    return NextResponse.json({ success: true, message: 'Zone supprimée' });
  } catch (error) {
    console.error('Error deleting delivery zone:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur de connexion au serveur' },
      { status: 500 }
    );
  }
}
