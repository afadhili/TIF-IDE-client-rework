import { CreateRoomDialog } from "@/components/CreateRoomDialog";
import { DeleteRoomDialog } from "@/components/DeleteRoomDialog";
import { EditRoomDialog } from "@/components/EditRoomDialog";
import Loading from "@/components/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import WaveDecorations from "@/components/WaveDecorations";
import { useAuth } from "@/context/use-auth";
import { getSocket } from "@/lib/api";
import type { Room } from "@/store/room.store";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LogOutIcon,
  PencilIcon,
  Plus,
  Search,
  Shield,
  Trash2Icon,
  Users2,
} from "lucide-react";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Link, useNavigate } from "react-router";

const ITEMS_PER_PAGE = 4;

export default function Rooms() {
  const navigate = useNavigate();
  const { loading, authenticated, logout, user, isAdmin } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [query, setQuery] = useState("");
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const socket = getSocket();

  const handleRoomsUpdate = useCallback((data: Room[]) => {
    setRooms(data);
    setIsLoading(false);
  }, []);

  const handleSocketError = useCallback((error: Error) => {
    console.error("Socket error:", error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    document.title = "TIF-IDE | All Rooms";
  }, []);

  useEffect(() => {
    if (!authenticated) {
      navigate("/");
      return;
    }

    socket.emit("getRooms");

    socket.on("rooms", handleRoomsUpdate);
    socket.on("error", handleSocketError);

    return () => {
      socket.off("rooms", handleRoomsUpdate);
      socket.off("error", handleSocketError);
    };
  }, [authenticated, navigate, socket, handleRoomsUpdate, handleSocketError]);

  const searchRooms = useMemo(() => {
    if (!query.trim()) return rooms;

    const lowercaseQuery = query.toLowerCase();
    return rooms.filter(
      (room) =>
        room.name.toLowerCase().includes(lowercaseQuery) ||
        room.description.toLowerCase().includes(lowercaseQuery) ||
        room.user.name.toLowerCase().includes(lowercaseQuery),
    );
  }, [rooms, query]);

  // Pagination logic
  const totalPages = Math.ceil(searchRooms.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRooms = searchRooms.slice(startIndex, endIndex);

  const handleLogout = useCallback(() => {
    logout();
  }, [logout]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setCurrentPage(1);
      setQuery(e.target.value);
    },
    [],
  );

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(1, currentPage - 2);
      const endPage = Math.min(totalPages, currentPage + 2);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  const handleDelete = (room: Room) => {
    setOpenDelete(true);
    setSelectedRoom(room);
  };

  const handleEdit = (room: Room) => {
    setOpenEdit(true);
    setSelectedRoom(room);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="relative z-10 container mx-auto px-4 py-8 mb-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex justify-end items-center mb-8 gap-2">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="text-slate-400 hover:text-white transition-colors border border-slate-700/50 hover:border-slate-600/50"
            >
              <LogOutIcon className="w-4 h-4 mr-2 rotate-180" />
              Sign Out
            </Button>
            {isAdmin(user) && (
              <Button asChild>
                <Link to="/admin">
                  <Shield />
                  Admin Page
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center justify-center mb-4">
            <img src="/logo.png" alt="Logo" className="w-12 h-12 mr-4" />
            <h1 className="text-5xl font-bold bg-linear-to-r from-white to-blue-100 bg-clip-text text-transparent">
              Available Rooms
            </h1>
          </div>

          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            Join any room and start collaborating with others in real-time
          </p>
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-card backdrop-blur-md rounded-2xl p-8 border border-slate-700/50 shadow-2xl">
            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search rooms by name, description, or creator..."
                  value={query}
                  onChange={handleSearchChange}
                  className="pl-12 pr-4 py-3 text-lg border-2 text-white placeholder-slate-400 rounded-xl"
                />
                {query && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    onClick={() => setQuery("")}
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="relative flex items-center justify-center">
                <div className="flex-1 h-px bg-slate-700/50" />
                <span className="px-4 text-sm text-slate-400 bg-card">
                  Or create your own room
                </span>
                <div className="flex-1 h-px bg-slate-700/50" />
              </div>

              <Button
                onClick={() => setOpenCreate(true)}
                className="w-full shadow-lg hover:shadow-xl"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-3" />
                Create New Room
              </Button>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="max-w-7xl mx-auto mb-8">
          {searchRooms.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-secondary backdrop-blur-md rounded-2xl p-12 border-2 border-dashed border-slate-700/50">
                <Users2 className="w-16 h-16 text-slate-500/50 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-slate-400 mb-2">
                  {query ? "No rooms found" : "No rooms available"}
                </h3>
                <p className="text-slate-500 mb-6">
                  {query
                    ? "Try adjusting your search terms or create a new room."
                    : "Be the first to create a room and start collaborating!"}
                </p>
                {query && (
                  <Button
                    variant="outline"
                    onClick={() => setQuery("")}
                    className="mr-4 border-slate-600/50 text-slate-300 hover:bg-slate-700/50"
                  >
                    Clear Search
                  </Button>
                )}
                <Button onClick={() => setOpenCreate(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-semibold text-white">
                    {query ? "Search Results" : "All Rooms"}
                  </h2>
                  <p className="text-slate-400 text-sm mt-1">
                    Showing {startIndex + 1}-
                    {Math.min(endIndex, searchRooms.length)} of{" "}
                    {searchRooms.length} rooms
                  </p>
                </div>
                <Badge
                  variant="secondary"
                  className="text-sm px-3 py-1 bg-slate-700/50 text-slate-300 border-slate-600/50"
                >
                  {searchRooms.length}{" "}
                  {searchRooms.length === 1 ? "room" : "rooms"}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {paginatedRooms.map((room) => (
                  <Card
                    key={room.id}
                    className="rounded-xl border-2 border-slate-700/50 backdrop-blur-sm hover:border-primary/30 hover:shadow-2xl transition-all duration-300 group"
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-xl font-bold line-clamp-2 text-white group-hover:text-primary/80 transition-colors">
                          {room.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="bg-slate-700/50 text-slate-300 border-slate-600/50"
                        >
                          {room.id.slice(0, 6)}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-400 text-base line-clamp-2 mt-2">
                        {room.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-4">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Created by:</span>
                          <span className="font-medium text-slate-200">
                            {room.user.name}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-slate-400">
                            <Users2 className="w-4 h-4 mr-2" />
                            <span>Online users:</span>
                          </div>
                          <Badge
                            variant="secondary"
                            className="bg-blue-500/20 text-blue-300 border-blue-400/30"
                          >
                            {room.activeUsers.length}
                          </Badge>
                        </div>
                        {room.activeUsers.length > 0 && (
                          <div className="flex items-center gap-1">
                            {room.activeUsers.slice(0, 4).map((user) => (
                              <Badge
                                key={user.id}
                                className="flex items-center"
                                variant="outline"
                              >
                                <span className="font-medium text-slate-200">
                                  {user.name}
                                </span>
                              </Badge>
                            ))}
                            {room.activeUsers.length > 4 && (
                              <Badge
                                className="flex items-center"
                                variant="outline"
                              >
                                <span className="font-medium text-slate-200">
                                  +{room.activeUsers.length - 4}
                                </span>
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </CardContent>

                    <CardFooter className="flex gap-2 pt-4 border-t border-slate-700/50 mt-auto">
                      <Button
                        asChild
                        variant="default"
                        className="flex-1 font-semibold"
                      >
                        <Link
                          to={`/rooms/${room.id}`}
                          className="flex items-center justify-center"
                        >
                          Join Room
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                      {(user?.id == room.user.id || user?.role == "admin") && (
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-slate-600/50 text-slate-400 hover:bg-blue-500/20 hover:text-blue-300 hover:border-blue-400/30 transition-colors"
                            onClick={() => handleEdit(room)}
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="border-slate-600/50 text-slate-400 hover:bg-red-500/20 hover:text-red-300 hover:border-red-400/30 transition-colors"
                            onClick={() => handleDelete(room)}
                          >
                            <Trash2Icon className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-700/50">
                  <div className="text-sm text-slate-400">
                    Page {currentPage} of {totalPages}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* First Page */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(1)}
                      disabled={currentPage === 1}
                      className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>

                    {/* Previous Page */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) =>
                        page === "..." ? (
                          <span
                            key={`ellipsis-${index}`}
                            className="px-2 text-slate-400"
                          >
                            ...
                          </span>
                        ) : (
                          <Button
                            key={page}
                            variant={
                              currentPage === page ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => goToPage(page as number)}
                            className={
                              currentPage === page
                                ? "bg-linear-to-r from-blue-500 to-purple-600 border-0"
                                : "border-slate-600/50 text-slate-400 hover:bg-slate-700/50"
                            }
                          >
                            {page}
                          </Button>
                        ),
                      )}
                    </div>

                    {/* Next Page */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>

                    {/* Last Page */}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => goToPage(totalPages)}
                      disabled={currentPage === totalPages}
                      className="border-slate-600/50 text-slate-400 hover:bg-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="text-sm text-slate-400">
                    {ITEMS_PER_PAGE} per page
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <WaveDecorations />

      <CreateRoomDialog open={openCreate} onOpenChange={setOpenCreate} />
      <DeleteRoomDialog
        open={openDelete}
        onOpenChange={setOpenDelete}
        room={selectedRoom}
      />
      <EditRoomDialog
        open={openEdit}
        onOpenChange={setOpenEdit}
        room={selectedRoom}
      />
    </div>
  );
}
