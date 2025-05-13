import { NextResponse } from 'next/server';

const modelsDB: any[] = [];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const creatorId = searchParams.get('creatorId');

  if (!creatorId) {
    return NextResponse.json({ error: 'Missing creatorId' }, { status: 400 });
  }

  const userModels = modelsDB.filter(model => model.creatorId === creatorId);
  return NextResponse.json(userModels, { status: 200 });
}

export async function POST(request: Request) {
  const newModel = await request.json();
  modelsDB.push(newModel);
  return NextResponse.json({ message: 'Model saved', model: newModel }, { status: 201 });
}