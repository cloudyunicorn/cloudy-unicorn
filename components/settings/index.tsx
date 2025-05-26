
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Suspense, useEffect, useState } from 'react'
import { getUserInfo, updateUserName } from '@/lib/actions/user.action'
import { UserMetadata } from "@supabase/supabase-js"
import { toast } from 'sonner'

export function UserSettings() {
  const [userData, setUserData] = useState<UserMetadata | null>(null);
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const fetchedData = await getUserInfo();
        if (fetchedData?.user_metadata) {
          setUserData(fetchedData.user_metadata)
        } else {
          console.warn('User metadata not found in response')
          setUserData(null)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
        setUserData(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [])

  const handleNameUpdate = async () => {
    try {
      if (!userData?.name) return;
      await updateUserName(userData.name);
      toast.success('Name updated successfully!');
    } catch (error) {
      console.error('Failed to update name:', error);
      toast.error('Failed to update name. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="name"
              className="w-auto"
              value={userData?.name || ''}
              onChange={(e) => setUserData(prev => ({
                ...prev,
                name: e.target.value
              }))}
            />
            <div className="pt-2">
              <Button onClick={handleNameUpdate}>
                Save Changes
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              className="w-auto"
              value={userData?.email || ''}
              readOnly
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="text-sm text-muted-foreground">
              <span>Free Plan</span>
            </div>
          </div>
          <Button variant="default">Upgrade</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <div className="text-sm text-muted-foreground">
              Coming soon
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-[200px]" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
            <Skeleton className="h-10 w-[100px]" />
          </CardContent>
        </Card>
      </div>
    }>
      <UserSettings />
    </Suspense>
  )
}
