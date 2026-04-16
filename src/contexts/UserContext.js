"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

const defaultValue = {
    user: null,
    loading: true,
    updateUser: () => { },
    refreshUser: () => { }
};

const UserContext = createContext(defaultValue);

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch("/api/auth/session");
            const data = await res.json();

            if (data?.user?.id) {
                try {
                    const profileRes = await fetch(`/api/users/profile/${data.user.id}`);
                    const profileData = await profileRes.json();
                    if (profileData.success && profileData.user) {
                        setUser(profileData.user);
                    } else {
                        // Fallback para dados da sessão
                        setUser(data.user);
                    }
                } catch {
                    // Se falhar o perfil, usa dados da sessão
                    setUser(data.user);
                }
            }
        } catch (err) {
            console.error("Failed to fetch user:", err);
        } finally {
            setLoading(false);
        }
    }, []);

    // Atualizar usuário localmente (sem fazer fetch)
    const updateUser = useCallback((newData) => {
        setUser(prev => prev ? { ...prev, ...newData } : newData);
    }, []);

    // Recarregar dados do servidor
    const refreshUser = useCallback(() => {
        setLoading(true);
        fetchUser();
    }, [fetchUser]);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    return (
        <UserContext.Provider value={{ user, loading, updateUser, refreshUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    return context;
}

