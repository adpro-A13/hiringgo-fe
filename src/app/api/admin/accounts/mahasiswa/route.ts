import { NextRequest, NextResponse } from 'next/server';
import { fetcher } from '@/components/lib/fetcher';


interface AddMahasiswaResponse {
    id: string;
    email: string;
    fullName: string;
    nim: string;
    role: string;
}

export async function POST(request: NextRequest) {
    const url = `/api/admin/accounts/mahasiswa`;
    const data = await request.json(); const response = await fetcher<AddMahasiswaResponse>(url, request, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    return NextResponse.json(
        {
            success: true,
            statusCode: 201,
            message: 'Mahasiswa account created successfully',
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