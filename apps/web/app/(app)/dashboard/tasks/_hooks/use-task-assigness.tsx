"use client"

import { UserSummary } from "@workspace/types";
import { createContext, ReactNode, useContext } from "react";

const AssigneesContext = createContext<UserSummary[] | undefined>(undefined)

type AssignessProviderProps = {
    assignees: UserSummary[]
    children: ReactNode
}

export function AssigneesProvider({ assignees, children }: AssignessProviderProps) {
    return (
        <AssigneesContext.Provider value={assignees}>
            {children}
        </AssigneesContext.Provider>
    )
}

export function useAssignees() {
    const context = useContext(AssigneesContext)
    if (!context) {
        throw new Error("useAssignees must be used within a AssigneesProvider")
    }
    return context;
}