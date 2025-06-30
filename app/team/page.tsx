import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const teamMembers = [
  { name: "Sofia Davis", email: "sofia.davis@example.com", role: "Admin", avatar: "/avatars/01.png" },
  { name: "Jackson Lee", email: "jackson.lee@example.com", role: "Member", avatar: "/avatars/02.png" },
];

export default function TeamPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader title="Team" />
        <main className="p-4 md:p-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                A list of all team members in your workspace.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="divide-y divide-gray-200">
                {teamMembers.map((member, index) => (
                  <li key={index} className="flex items-center justify-between py-4">
                    <div className="flex items-center space-x-4">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{member.role}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
} 