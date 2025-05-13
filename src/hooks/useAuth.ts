import { useEffect, useState } from "react";
import type { User } from "@/types"; 

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser) as User);
      } catch (error) {
        console.error("Error from localStorage", error);
      }
    }
  }, []);

  return { user, setUser };
}