"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { getCurrentUser } from '@/lib/auth/authService';
import Background3D from '@/components/Background3D';
import { Settings, BookOpen, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to view your profile</h1>
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Background3D />
      <div className="min-h-screen pt-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-6 backdrop-blur-lg bg-background/80">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="flex flex-col items-center">
                <Avatar className="w-32 h-32" />
                <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
                <div className="mt-4 space-x-2">
                  <Link href="/settings">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <Card className="p-4 text-center">
                    <BookOpen className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Posts</h3>
                    <p className="text-2xl font-bold">12</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Heart className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Likes</h3>
                    <p className="text-2xl font-bold">48</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <Share2 className="w-8 h-8 mx-auto mb-2" />
                    <h3 className="font-semibold">Shares</h3>
                    <p className="text-2xl font-bold">24</p>
                  </Card>
                </div>

                <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
                <div className="space-y-4">
                  {/* Activity items would go here */}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
}