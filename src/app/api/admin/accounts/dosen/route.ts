import { NextRequest, NextResponse } from 'next/server';
import { fetcher } from '@/components/lib/fetcher';


interface AddMahasiswaResponse {
    email: string;
    fullName: string;
    nip: string;
    role: string;
}

export async function POST(request: NextRequest) {
    const url = `/api/admin/accounts/dosen`;
    const data = await request.json(); const response = await fetcher<AddMahasiswaResponse>(url, request, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    return NextResponse.json(
        {
            success: true,
            statusCode: 201,
            message: 'Dosen account created successfully',
            data: response,
            timestamp: new Date().toISOString(),
        },
        {
            status: 201,
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );
}