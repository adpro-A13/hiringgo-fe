import { NextRequest, NextResponse } from 'next/server';
import { fetcher } from '@/components/lib/fetcher';

interface UserData {
    id: string;
    email: string;
    fullName: string;
    nim: string;
    nip: string;
    role: string;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleRequest(request, 'GET', id);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleRequest(request, 'PUT', id);
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleRequest(request, 'DELETE', id);
}

export async function OPTIONS(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    return handleRequest(request, 'OPTIONS', id);
}

async function handleRequest(request: NextRequest, method: string, id: string) {
    const url = `/api/admin/accounts/${id}`;

    let data = undefined;
    if (method === 'PUT' || method === 'POST') {
        data = await request.json();
    } let response;
    try {
        response = await fetcher<UserData | null>(url, request, {
            method: method,
            body: data ? JSON.stringify(data) : undefined,
        });

        // Handle successful operations - fetcher returns data directly or null for 204 responses
        return NextResponse.json(
            {
                success: true,
                statusCode: 200,
                message: method === 'DELETE' ? 'User deleted successfully' :
                    method === 'PUT' ? 'User updated successfully' :
                        'Operation completed successfully',
                data: response,
                timestamp: new Date().toISOString(),
            },
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            }
        );

    } catch (err: any) {
        console.error(`Error in ${method} request:`, err);
        return NextResponse.json(
            {
                success: false,
                statusCode: err?.status || 500,
                message: err?.message || 'Internal Server Error',
                data: null,
                timestamp: new Date().toISOString(),
            },
            {
                status: err?.status || 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}