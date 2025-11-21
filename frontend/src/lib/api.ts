import axios, { AxiosHeaders, type AxiosInstance } from "axios"
import type { BookingCreatePayload, Listing } from "./types"

const BASE_URL = 
import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.length > 0
? import.meta.env.VITE_API_URL
: "/api"

import.meta.env && console.log("API base:", import.meta.env.VITE_API_URL);


export const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {"Content-Type": "application/json" }
})

api.interceptors.request.use((config) => {
    const t = localStorage.getItem("token")
    if(t) {
    const h = config.headers as AxiosHeaders | Record<string, any> | undefined
    if (h && typeof (h as any).set === "function") {
        (h as AxiosHeaders).set("Authorization", `Bearer ${t}`)
    } else {
        config.headers = {
            ...(h ?? {}),
            Authorization: `Bearer ${t}`
        } as any
    }
}
    return config
})

type ListingQuery = {place: string; from: string; to: string, guests: number}

export function getListings(
    params: ListingQuery = {place: "", from: "", to: "", guests: 1}
) {
return api.get<Listing[]>("/listing", { params})
}

export function getListingById(id: string) {
    return api.get<Listing>("/listing/" + id)
}

export function searchListings(params: {
    place?: string
    from?: string
    to?: string
    guests?: number
}) {
    return api.get<Listing[]>("/listing/search", { params})
}


export function setAuthToken(token: string | null): void {
    if (token && token.length > 0) {
        api.defaults.headers.common.Authorization = "Bearer " + token
    } else {
        delete api.defaults.headers.common.Authorization
    }
}

export type User = {
    _id: string
    email: string
    name: string
    role: "admin" | "user"
}

export type LoginPayload = { email: string; password: string}
export type RegisterPayload = { name: string; email: string; password: string}

export type AuthResponse = {user: User; token: string}

export function login(payload: LoginPayload) {
  return api.post<AuthResponse>("/user/login", payload)
}
export function register(payload: RegisterPayload) {
  return api.post<AuthResponse>("/user/register", payload)
}


export function createListing(payload: Partial<Listing>){
    return api.post<Listing>("/listing", payload)
}
export function updateListing(id: string, payload: Partial<Listing>){
    return api.put<Listing>(`/listing/${id}`, payload)
}
export function deleteListing(id: string){
    return api.delete<{ message: string }>(`/listing/${id}`)
}

export function createBooking(payload: BookingCreatePayload) {
    return api.post("/bookings", payload)
}

export const getMyBookings = () => api.get("/bookings")
export async function deleteBooking(id: string) {
    return axios.delete(`/api/bookings/${id}`)
}
export const updateBookingStatus = (id: string, data:any) => api.patch(`/bookings/${id}`, data)
 

