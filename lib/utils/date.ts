import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate une date au format français complet
 * Exemple: "15 janvier 2020"
 */
export function formatDateFull(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "d MMMM yyyy", { locale: fr });
}

/**
 * Formate une date au format court français
 * Exemple: "15 jan 2020"
 */
export function formatDateShort(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "d MMM yyyy", { locale: fr });
}

/**
 * Formate une date avec l'heure
 * Exemple: "15 janvier 2020 à 14:30"
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "d MMMM yyyy 'à' HH:mm", { locale: fr });
}

/**
 * Formate une date au format ISO pour les inputs HTML
 * Exemple: "2020-01-15"
 */
export function formatDateInput(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "yyyy-MM-dd");
}

/**
 * Formate une date relative (il y a X jours)
 * Exemple: "il y a 3 jours"
 */
export function formatDateRelative(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: fr });
}

/**
 * Formate une date pour l'affichage dans les cartes (mois et année)
 * Exemple: "janvier 2020"
 */
export function formatDateMonthYear(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMMM yyyy", { locale: fr });
}

/**
 * Formate une date pour l'affichage dans les graphiques (mois court)
 * Exemple: "Jan", "Fév", "Mar"
 */
export function formatDateMonthShort(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, "MMM", { locale: fr });
}



