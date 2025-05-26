"use client";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import AdminSidebar from "@/components/dashboard/admin/sidebar";
import { fetcher } from "@/components/lib/fetcher";
import { useForm } from "react-hook-form";

interface User {
    id: string;
    email: string;
    fullName: string;
    identifier: string;
    role: string;
    createdAt: string;
}

export default function ManajemenAkun() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [openDialog, setOpenDialog] = useState(false);
    const [dialogType, setDialogType] = useState<"add" | "edit" | "delete">("add");
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    const { register, handleSubmit, reset, watch, formState: { errors, isSubmitting } } = useForm({
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            identifier: "",
            role: "MAHASISWA"
        }
    });
    const role = watch("role");
    const password = watch("password");

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        setIsLoading(true);
        try {
            console.log("Fetching users...");
            const users = await fetcher<any>(`/api/admin/accounts`);
            console.log("Users fetched:", users);

            if (Array.isArray(users)) {
                setUsers(users.map((user: any) => ({
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName || "",
                    identifier: user.nim || user.nip || "",
                    role: user.role,
                    createdAt: user.createdAt || new Date().toISOString().split('T')[0]
                })));
            } else if (users && typeof users === 'object' && 'data' in users) {
                setUsers(users.data.map((user: any) => ({
                    id: user.id,
                    email: user.email,
                    fullName: user.fullName || "",
                    identifier: user.nim || user.nip || "",
                    role: user.role,
                    createdAt: user.createdAt || new Date().toISOString().split('T')[0]
                })));
            } else {
                console.warn("Unexpected users format:", users);
                setUsers([]);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");

            setUsers([
                {
                    id: "1",
                    email: "admin@hiringgo.id",
                    fullName: "Admin User",
                    identifier: "AD001",
                    role: "ADMIN",
                    createdAt: "2023-05-10"
                },
                {
                    id: "2",
                    email: "dosen@hiringgo.id",
                    fullName: "Dosen Example",
                    identifier: "DS001",
                    role: "DOSEN",
                    createdAt: "2023-05-11"
                },
                {
                    id: "3",
                    email: "mahasiswa@hiringgo.id",
                    fullName: "Mahasiswa Example",
                    identifier: "MHS001",
                    role: "MAHASISWA",
                    createdAt: "2023-05-12"
                }
            ]);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const filteredUsers = useMemo(() => users.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.identifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    ), [users]);

    const openAddDialog = () => {
        setDialogType("add");
        reset({
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
            identifier: "",
            role: "MAHASISWA"
        });
        setOpenDialog(true);
    };

    const openEditDialog = (user: User) => {
        setDialogType("edit");
        setSelectedUser(user);

        reset({
            email: user.email,
            password: "",
            confirmPassword: "",
            fullName: user.fullName,
            identifier: user.identifier,
            role: user.role
        });
        setOpenDialog(true);
    };

    const openDeleteDialog = (user: User) => {
        setDialogType("delete");
        setSelectedUser(user);
        setOpenDialog(true);
    };

    const onSubmit = async (data: any) => {
        if (dialogType === "add" || (dialogType === "edit" && data.password)) {
            if (data.password !== data.confirmPassword) {
                toast.error("Passwords do not match");
                throw new Error("Passwords do not match");
            }
        }

        console.log("Submitting form data:", data);
        if (dialogType === "add") {
            let endpoint = '';
            let userData: any = {};
            if (data.role === "ADMIN") {
                endpoint = `/api/admin/accounts/admin`;
                userData = {
                    email: data.email,
                    password: data.password,
                };
            } else if (data.role === "DOSEN") {
                endpoint = `/api/admin/accounts/dosen`;
                userData = {
                    email: data.email,
                    password: data.password,
                    fullName: data.fullName,
                    nip: data.identifier
                };
            } else if (data.role === "MAHASISWA") {
                endpoint = `/api/admin/accounts/mahasiswa`;
                userData = {
                    email: data.email,
                    password: data.password,
                    fullName: data.fullName,
                    nim: data.identifier
                };
            }
            const result = await fetcher(endpoint, undefined, {
                method: "POST",
                body: JSON.stringify(userData)
            });

            toast.success("User added successfully");
            await fetchUsers();
            setOpenDialog(false);
        }
        else if (dialogType === "edit" && selectedUser) {
            const updateEndpoint = `/api/admin/accounts/${selectedUser.id}`;
            let updateData: any = {
                email: data.email,
                newRole: data.role,
                identifier: data.identifier
            };

            if (data.role !== "ADMIN") {
                updateData.fullName = data.fullName;
            }

            if (data.password) {
                updateData.password = data.password;
            }

            console.log(`Updating user with ID ${selectedUser.id}:`, updateData);
            try {
                const result = await fetcher(updateEndpoint, undefined, {
                    method: "PUT",
                    body: JSON.stringify(updateData)
                });

                toast.success("User updated successfully");
                await fetchUsers();
                setOpenDialog(false);
            } catch (updateError: any) {
                console.error("Update error details:", updateError);

                if (updateError.status === 403 || updateError.status === 400) {
                    if (updateError.message?.includes('own account') ||
                        updateError.message?.includes('self') ||
                        updateError.message?.includes('current user')) {
                        toast.error("You cannot edit your own account for security reasons. Please ask another admin to make changes to your account.");
                    } else {
                        toast.error(`Failed to update user: ${updateError.message || 'Access denied'}`);
                    }
                } else {
                    toast.error(`Failed to update user: ${updateError.message || 'Unknown error'}`);
                }
                throw updateError;
            }
        }
        else if (dialogType === "delete" && selectedUser) {
            console.log(`Deleting user with ID: ${selectedUser.id}`);
            const deleteUrl = `/api/admin/accounts/${selectedUser.id}`;
            await fetcher(deleteUrl, undefined, {
                method: "DELETE"
            });

            toast.success("User deleted successfully");
            await fetchUsers();
            setOpenDialog(false);
        }
    };

    return (
        <AdminSidebar>
            <Card className="w-full">
                <CardHeader>
                    <CardTitle>User Management</CardTitle>
                    <CardDescription>View, add, edit, and delete user accounts</CardDescription>
                </CardHeader>
                <CardContent>                    <div className="flex justify-between mb-6">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="max-w-sm"
                        />
                        <Button variant="outline" onClick={fetchUsers} disabled={isLoading}>
                            {isLoading ? "Refreshing..." : "Refresh"}
                        </Button>
                    </div>
                    <Button onClick={openAddDialog}>Add New User</Button>
                </div>

                    {isLoading ? (
                        <div className="text-center py-4">Loading users...</div>
                    ) : (
                        <Table>
                            <TableHeader><TableRow>
                                <TableHead>Email</TableHead>
                                <TableHead>Full Name</TableHead>
                                <TableHead>Identifier (NIM/NIP)</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Created At</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {filteredUsers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center">
                                            No users found
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>{user.fullName}</TableCell>
                                            <TableCell>{user.identifier}</TableCell>
                                            <TableCell>{user.role}</TableCell>
                                            <TableCell>{user.createdAt}</TableCell>
                                            <TableCell>
                                                <div className="flex space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => openEditDialog(user)}
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        onClick={() => openDeleteDialog(user)}
                                                    >
                                                        Delete
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {dialogType === "add"
                                ? "Add New User"
                                : dialogType === "edit"
                                    ? "Edit User"
                                    : "Delete User"}
                        </DialogTitle>
                        <DialogDescription>
                            {dialogType === "delete"
                                ? `Are you sure you want to delete ${selectedUser?.fullName}?`
                                : "Enter the user details below."}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        {dialogType !== "delete" && (
                            <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                    <label htmlFor="role">Role</label>
                                    <select
                                        id="role"
                                        {...register("role", { required: true })}
                                        className="w-full border rounded-md p-2"
                                    >
                                        <option value="ADMIN">Admin</option>
                                        <option value="DOSEN">Dosen</option>
                                        <option value="MAHASISWA">Mahasiswa</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email">Email</label>
                                    <Input
                                        id="email"
                                        {...register("email", { required: true })}
                                    />
                                </div>

                                {(dialogType === "add" || dialogType === "edit") && (
                                    <>
                                        <div className="space-y-2">
                                            <label htmlFor="password">
                                                {dialogType === "add" ? "Password" : "New Password (leave blank to keep unchanged)"}
                                            </label>
                                            <Input
                                                id="password"
                                                {...register("password")}
                                                type="password"
                                                required={dialogType === "add"}
                                            />
                                        </div>
                                        {(password || dialogType === "add") && (
                                            <div className="space-y-2">
                                                <label htmlFor="confirmPassword">Confirm Password</label>
                                                <Input
                                                    id="confirmPassword"
                                                    {...register("confirmPassword")}
                                                    type="password"
                                                    required={dialogType === "add" || password.length > 0}
                                                />
                                            </div>
                                        )}
                                    </>
                                )}

                                {role !== "ADMIN" && (
                                    <div className="space-y-2">
                                        <label htmlFor="fullName">Full Name</label>
                                        <Input
                                            id="fullName"
                                            {...register("fullName", { required: true })}
                                        />
                                    </div>
                                )}

                                {(role !== "ADMIN" || dialogType === "add") && (
                                    <div className="space-y-2">
                                        <label htmlFor="identifier">
                                            {role === "MAHASISWA" ? "NIM" :
                                                role === "DOSEN" ? "NIP" : "Admin ID"}
                                        </label>
                                        <Input
                                            id="identifier"
                                            {...register("identifier", { required: true })}
                                            placeholder={
                                                role === "MAHASISWA" ? "Enter student ID (NIM)" :
                                                    role === "DOSEN" ? "Enter lecturer ID (NIP)" :
                                                        "Enter admin ID"
                                            }
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpenDialog(false)}
                            >
                                Cancel
                            </Button>
                            {dialogType === "delete" ? (
                                <Button
                                    type="submit"
                                    variant="destructive"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Processing..." : "Delete User"}
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    variant={dialogType === "edit" ? "default" : "secondary"}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? "Processing..." : dialogType === "add"
                                        ? "Add User"
                                        : dialogType === "edit"
                                            ? "Save Changes"
                                            : "Delete User"}
                                </Button>
                            )}
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminSidebar>
    );
}