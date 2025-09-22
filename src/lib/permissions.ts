import { getServerSession } from 'next-auth'
import { authOptions } from './auth'

export type UserRole = 'viewer' | 'editor' | 'admin'

export interface UserPermissions {
  canView: boolean
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canManageAccess: boolean
  canManageExpenses: boolean
  canManageMembers: boolean
  canManageTeams: boolean
  canManageSeasons: boolean
  canManageSchedule: boolean
}

export function getUserPermissions(role: UserRole): UserPermissions {
  switch (role) {
    case 'admin':
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: true,
        canManageAccess: true,
        canManageExpenses: true,
        canManageMembers: true,
        canManageTeams: true,
        canManageSeasons: true,
        canManageSchedule: true,
      }
    case 'editor':
      return {
        canView: true,
        canCreate: true,
        canEdit: true,
        canDelete: false, // Editors cannot delete
        canManageAccess: false, // Editors cannot manage access
        canManageExpenses: true,
        canManageMembers: true,
        canManageTeams: true,
        canManageSeasons: true,
        canManageSchedule: true,
      }
    case 'viewer':
      return {
        canView: true,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageAccess: false,
        canManageExpenses: true, // Viewers can view expenses
        canManageMembers: true, // Viewers can view members
        canManageTeams: true, // Viewers can view teams
        canManageSeasons: true, // Viewers can view seasons
        canManageSchedule: true, // Viewers can view schedule
      }
    default:
      return {
        canView: false,
        canCreate: false,
        canEdit: false,
        canDelete: false,
        canManageAccess: false,
        canManageExpenses: false,
        canManageMembers: false,
        canManageTeams: false,
        canManageSeasons: false,
        canManageSchedule: false,
      }
  }
}

export async function getCurrentUserPermissions(): Promise<UserPermissions> {
  const session = await getServerSession(authOptions)
  const role = (session?.user as { role?: string })?.role as UserRole || 'unauthorized'
  return getUserPermissions(role)
}
