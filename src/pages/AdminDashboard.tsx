import { useState, useEffect, useMemo, useCallback, type JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserPlus,
  Activity,
  Shield,
  Trash2,
  LayoutGrid,
  List,
  MoreVertical,
  Users,
  Key,
  FilePlus2,
  FilePenIcon,
  LogOut,
  LogIn,
  Loader2,
  AlertTriangle,
  PlusCircle,
  Download,
  ArrowLeft,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { User as DBUser, User } from "@/lib/auth";
import { fetchWithAuth, getSocket } from "@/lib/api";
import { useAuth } from "@/context/use-auth";
import { getInitials } from "@/lib/utils";
import { Link, useNavigate } from "react-router";

type UserActivityType =
  | "logout"
  | "login"
  | "file_create"
  | "file_delete"
  | "room_create"
  | "room_delete"
  | "room_update"
  | "room_download";

interface UserData {
  id: number;
  nim: string;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  status: "active" | "offline";
  lastActive: string;
  roomsCount: number;
  contributionsCount: number;
}

interface ActivityData {
  id: number;
  userId: number;
  type: UserActivityType;
  description: string;
  details: string;
  timestamp: string;
}

const ACTIVITY_ICONS: Record<UserActivityType, JSX.Element> = {
  login: <LogIn className="h-4 w-4 text-blue-500" />,
  logout: <LogOut className="h-4 w-4 text-gray-500" />,
  file_create: <FilePlus2 className="h-4 w-4 text-green-500" />,
  file_delete: <Trash2 className="h-4 w-4 text-red-500" />,
  room_create: <PlusCircle className="h-4 w-4 text-green-500" />,
  room_delete: <Trash2 className="h-4 w-4 text-red-500" />,
  room_update: <FilePenIcon className="h-4 w-4 text-yellow-500" />,
  room_download: <Download className="h-4 w-4 text-blue-500" />,
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-500/20 text-green-300",
  offline: "bg-gray-500/20 text-gray-300",
};

const ROLE_CONFIG: Record<
  string,
  { color: string; icon: JSX.Element; label: string }
> = {
  admin: {
    color: "bg-purple-500/20 text-purple-300",
    icon: <Shield className="h-4 w-4 mr-1 text-purple-300" />,
    label: "Admin",
  },
  user: {
    color: "bg-blue-500/20 text-blue-300",
    icon: <Users className="h-4 w-4 mr-1 text-blue-300" />,
    label: "User",
  },
};

const parseActivityDetails = (details: string): Record<string, string> => {
  try {
    return JSON.parse(details);
  } catch {
    return { raw: details };
  }
};

const StatusBadge = ({ status }: { status: string }) => {
  const colorClass = STATUS_COLORS[status] || "bg-gray-500/20 text-gray-700";
  return (
    <Badge
      variant="secondary"
      className={`${colorClass} rounded-full px-2 py-0.5`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

const RoleBadge = ({ role }: { role: string }) => {
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.user;
  return (
    <Badge
      variant="secondary"
      className={`${config.color} rounded-full flex items-center px-2 py-0.5`}
    >
      {config.icon}
      {config.label}
    </Badge>
  );
};

const UserGridItem = ({
  user,
  currentUser,
  onSelect,
}: {
  user: UserData;
  currentUser: User;
  onSelect: (user: UserData) => void;
}) => (
  <Card
    className="group cursor-pointer hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-800"
    onClick={() => onSelect(user)}
  >
    <CardContent className="p-4">
      <div className="flex items-center space-x-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">{user.name}</p>
            <RoleBadge role={user.role} />
          </div>
          <p className="text-sm text-muted-foreground truncate font-mono">
            {user.nim}
          </p>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <StatusBadge status={user.status} />
              <span className="text-xs text-muted-foreground">
                {currentUser.id === user.id || user.status === "active"
                  ? "Currently Active"
                  : formatDistanceToNow(new Date(user.lastActive), {
                      addSuffix: true,
                    })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ActivityItem = ({ activity }: { activity: ActivityData }) => {
  const parsedDetails = useMemo(
    () => parseActivityDetails(activity.details),
    [activity.details],
  );

  return (
    <div className="flex items-start space-x-3 p-3 hover:bg-muted/30 rounded-lg transition-colors">
      <div className="mt-1 shrink-0">
        {ACTIVITY_ICONS[activity.type] || (
          <Activity className="h-4 w-4 text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">{activity.description}</p>
        <div className="mt-1 text-xs text-muted-foreground space-y-1">
          {Object.entries(parsedDetails).map(([key, value]) => (
            <div key={key} className="flex">
              <span className="font-medium mr-1 capitalize">{key}:</span>
              <span className="break-all">{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
              {new Date(activity.timestamp).toLocaleTimeString()}
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="text-xs">
            {format(new Date(activity.timestamp), "PPpp")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default function AdminDashboard() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const { user: currentUser, isAdmin } = useAuth();
  const socket = getSocket();
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    if (!currentUser) {
      navigate("/");
    } else if (!isAdmin(currentUser)) {
      navigate("/rooms");
    }

    try {
      const usersRes = await fetchWithAuth("/admin/users");
      if (!usersRes.ok) {
        const errorData = await usersRes.json();
        throw new Error(errorData.error || "Failed to fetch users");
      }
      const rawUsers: DBUser[] = await usersRes.json();

      const transformedUsers: UserData[] = rawUsers.map((user) => ({
        id: user.id,
        nim: user.nim,
        name: user.name || `User ${user.id}`,
        role: user.role || "user",
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        status:
          currentUser && user.id === currentUser.id ? "active" : user.status,
        lastActive: user.lastOnline || user.updatedAt,
        roomsCount: user.rooms?.length || 0,
        contributionsCount: user.contributors?.length || 0,
      }));

      const activitiesRes = await fetchWithAuth("/admin/activities");
      if (!activitiesRes.ok) {
        throw new Error("Failed to fetch activities");
      }
      const rawActivities: ActivityData[] = await activitiesRes.json();

      setUsers(transformedUsers);
      setActivities(rawActivities);
    } catch (err) {
      console.error("Data fetch error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard data";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, isAdmin, navigate]);

  useEffect(() => {
    const handleUserState = ({
      userId,
      status,
    }: {
      userId: number;
      status: "active" | "offline";
    }) => {
      if (!selectedUser) return;
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, status, lastActive: new Date().toISOString() }
            : user,
        ),
      );

      if (selectedUser.id === userId) {
        setSelectedUser({
          ...selectedUser,
          status,
          lastActive: new Date().toISOString(),
        });
      }
    };
    const handleUserActivity = ({ activity }: { activity: ActivityData }) => {
      setActivities((prev) => [activity, ...prev]);
    };

    socket.on("userState", handleUserState);
    socket.on("userActivity", handleUserActivity);

    return () => {
      socket.off("userState", handleUserState);
      socket.off("userActivity", handleUserActivity);
    };
  }, [socket, selectedUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    return users
      .filter((user) => {
        const matchesSearch =
          user.nim.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.id.toString().includes(searchQuery.toLowerCase());

        const matchesStatus =
          statusFilter === "all" || user.status === statusFilter;
        const matchesRole = roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesStatus && matchesRole;
      })
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
      );
  }, [searchQuery, statusFilter, roleFilter, users]);

  const userActivities = useMemo(() => {
    if (!selectedUser) return [];
    return activities
      .filter((activity) => activity.userId === selectedUser.id)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }, [selectedUser, activities]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages],
  );

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handleStatusFilter = useCallback((value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  }, []);

  const handleRoleFilter = useCallback((value: string) => {
    setRoleFilter(value);
    setCurrentPage(1);
  }, []);

  const handleDeleteUser = async (user: UserData) => {
    if (user.role === "admin") {
      toast.error("Cannot delete admin users");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetchWithAuth(`/admin/users/${user.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to delete user");
      }

      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      setActivities((prev) => prev.filter((a) => a.userId !== user.id));

      if (selectedUser?.id === user.id) {
        setSelectedUser(null);
      }

      toast.success(`User ${user.name} (NIM: ${user.nim}) has been deleted`);
    } catch (err) {
      console.error("Delete error:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to delete user. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetPassword = useCallback((user: UserData) => {
    toast.info(`Still on development`, {
      description: `resetting password for nim ${user.nim}`,
    });
  }, []);

  const renderEmptyState = (
    message: string,
    icon: JSX.Element,
    subMessage?: string,
  ) => (
    <div className="text-center py-12">
      {icon}
      <h3 className="text-lg font-medium text-foreground mt-2">{message}</h3>
      {subMessage && <p className="text-muted-foreground mt-1">{subMessage}</p>}
    </div>
  );

  const renderErrorState = () => (
    <Alert variant="destructive" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  );

  if (error && !users.length) {
    return (
      <div className="p-8 w-full min-h-screen flex items-center justify-center">
        {renderErrorState()}
        <Button onClick={fetchData} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1920px] mx-auto">
      {error && renderErrorState()}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button asChild size="lg" variant="outline">
            <Link to="/rooms">
              <ArrowLeft />
              Back to rooms
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">User Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage users and monitor system activities
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
          <Button disabled>
            <UserPlus className="mr-2 h-4 w-4" />
            Add User (Coming Soon)
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users by name, NIM, or ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Select
            value={statusFilter}
            onValueChange={handleStatusFilter}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={roleFilter}
            onValueChange={handleRoleFilter}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
              <CardTitle className="text-lg font-semibold">
                Users ({filteredUsers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setViewMode((prev) => (prev === "table" ? "grid" : "table"))
                }
                className="h-8"
              >
                {viewMode === "table" ? (
                  <>
                    <LayoutGrid className="mr-2 h-4 w-4" />
                    Grid View
                  </>
                ) : (
                  <>
                    <List className="mr-2 h-4 w-4" />
                    Table View
                  </>
                )}
              </Button>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-[200px]" />
                        <Skeleton className="h-3 w-[150px]" />
                      </div>
                      <Skeleton className="h-8 w-20" />
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length === 0 ? (
                renderEmptyState(
                  "No users found",
                  <Search className="mx-auto h-12 w-12 text-muted-foreground" />,
                  "Try adjusting your search or filters",
                )
              ) : viewMode === "table" ? (
                <div className="overflow-x-auto -mx-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">User</TableHead>
                        <TableHead>NIM</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Last Active</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedUsers.map((user) => (
                        <TableRow
                          key={user.id}
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => setSelectedUser(user)}
                        >
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {getInitials(user.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="min-w-0">
                                <p className="font-medium truncate">
                                  {user.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  ID: {user.id}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="font-mono">
                            {user.nim}
                          </TableCell>
                          <TableCell>
                            <StatusBadge status={user.status} />
                          </TableCell>
                          <TableCell>
                            <RoleBadge role={user.role} />
                          </TableCell>
                          <TableCell>
                            {currentUser.id === user.id ||
                            user.status === "active"
                              ? "Currently Active"
                              : formatDistanceToNow(new Date(user.lastActive), {
                                  addSuffix: true,
                                })}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetPassword(user);
                                  }}
                                >
                                  <Key className="mr-2 h-4 w-4" />
                                  Reset Password
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteUser(user);
                                  }}
                                  className="text-destructive focus:text-destructive"
                                  disabled={user.role === "admin" || isDeleting}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {isDeleting ? "Deleting..." : "Delete User"}
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {paginatedUsers.map((user) => (
                    <UserGridItem
                      key={user.id}
                      user={user}
                      currentUser={currentUser}
                      onSelect={setSelectedUser}
                    />
                  ))}
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-between px-2 py-4 border-t mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredUsers.length)}{" "}
                    of {filteredUsers.length} users
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="px-2 text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          {selectedUser ? (
            <Card className="sticky top-4 h-fit border border-gray-200 dark:border-gray-800">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold">
                    {selectedUser.name}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground font-mono">
                    NIM: {selectedUser.nim}
                  </p>
                </div>
                <RoleBadge role={selectedUser.role} />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 pb-4 border-b">
                    <Avatar className="h-16 w-16">
                      <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                        {getInitials(selectedUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <StatusBadge status={selectedUser.status} />
                        <span className="text-sm text-muted-foreground">
                          ID: {selectedUser.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge
                          variant="secondary"
                          className="bg-blue-500/10 text-blue-700"
                        >
                          {selectedUser.roomsCount} Rooms
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="bg-purple-500/10 text-purple-700"
                        >
                          {selectedUser.contributionsCount} Contributions
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <Tabs defaultValue="activities" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                      <TabsTrigger value="activities">Activities</TabsTrigger>
                      <TabsTrigger value="details">Details</TabsTrigger>
                    </TabsList>
                    <TabsContent value="activities" className="mt-0">
                      {userActivities.length === 0 ? (
                        renderEmptyState(
                          "No activities recorded",
                          <Activity className="mx-auto h-10 w-10 text-muted-foreground" />,
                        )
                      ) : (
                        <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hidden pr-2">
                          {userActivities.map((activity) => (
                            <ActivityItem
                              key={activity.id}
                              activity={activity}
                            />
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="details" className="mt-0">
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">
                              Created At
                            </p>
                            <p>
                              {format(new Date(selectedUser.createdAt), "PPpp")}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground text-xs mb-1">
                              Last Active
                            </p>
                            <p>
                              {format(new Date(selectedUser.updatedAt), "PPpp")}
                            </p>
                          </div>
                          <div className="col-span-2">
                            <p className="text-muted-foreground text-xs mb-1">
                              Account Status
                            </p>
                            <StatusBadge status={selectedUser.status} />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 max-h-[400px] overflow-y-auto scrollbar-hidden pr-2 mt-4">
                        <p className="text-muted-foreground text-xs mb-1">
                          Last Activity
                        </p>
                        <ActivityItem
                          key={userActivities[0].id}
                          activity={userActivities[0]}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="pt-4 border-t space-y-3">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => handleResetPassword(selectedUser)}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      Reset Password
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={selectedUser.role === "admin" || isDeleting}
                        >
                          {isDeleting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete User
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete User</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete{" "}
                            <span className="font-medium">
                              {selectedUser.name}
                            </span>
                            &apos;s account (NIM: {selectedUser.nim}) and all
                            associated data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(selectedUser)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            {isDeleting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              "Delete User"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center p-8 text-center text-muted-foreground border-2 border-dashed">
              <div className="space-y-4">
                <div className="mx-auto p-3 bg-muted rounded-full">
                  <Users className="h-8 w-8 text-muted-foreground/70" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground">
                    No User Selected
                  </h3>
                  <p className="mt-1">
                    Click on a user from the list to view their details and
                    activity log
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
