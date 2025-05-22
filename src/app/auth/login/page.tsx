'use client';
// Note: Ini hapus aja karena burik, gw cmn buat testing
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      interface LoginResponse {
        token: string;
        [key: string]: any;
      }

      const response = await axios.post<LoginResponse>('http://localhost:8080/auth/login', {
        email,
        password
      });

      const { token } = response.data;
      localStorage.setItem('token', token);
      setError('');
      router.push('/success'); // ganti dengan page setelah login
    } catch (err: any) {
      setError(err?.response?.data || 'Login failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Login</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input 
              type="email" 
              placeholder="Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              autoFocus 
            />
            <Input 
              type="password" 
              placeholder="Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
            <Button type="submit" className="w-full">Login</Button>
            {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
