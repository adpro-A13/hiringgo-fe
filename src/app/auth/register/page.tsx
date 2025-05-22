'use client';
// Note: Ini nanti hapus aja karena burik, gw cmn buat testing
import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    nim: '',
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    // Optional: Simple client-side password confirmation check
    if (formData.password !== formData.confirmPassword) {
      setError('Password and Confirm Password do not match');
      return;
    }

    try {
      await axios.post('http://localhost:8080/auth/register', formData);
      setError('');
      router.push('/auth/login');
    } catch (err: any) {
      setError(err?.response?.data || 'Register failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-semibold">Register</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
            <Input
              type="text"
              name="fullName"
              placeholder="Full Name"
              value={formData.fullName}
              onChange={handleChange}
              required
            />
            <Input
              type="text"
              name="nim"
              placeholder="NIM"
              value={formData.nim}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button type="submit" className="w-full">
              Register
            </Button>
            {error && <p className="text-sm text-red-600 mt-2 text-center">{error}</p>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
