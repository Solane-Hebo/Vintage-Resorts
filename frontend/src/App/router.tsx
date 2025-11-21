import { createBrowserRouter, Navigate } from "react-router-dom";
import LoginPage from "./Pages/auth/LoginPage";
import Home from "./Pages/Home";
import SearchPage from "./Pages/SearchPage";
import ListingDetailPage from "./Pages/ListingDetailPage";
import { RequireAuth } from "../lib/auth";
import MyBookingsPage from "./Pages/Booking/MyBookings";
import Layout from "./Layout";
import BookingThanksPage from "./Pages/Booking/BookingThanksPage";
import BookingFlowPage from "./Pages/Booking/BookingFlowPage";
import RegisterPage from "./Pages/auth/RegisterPage";
import RequireAdmin from "./RequireAdmin";
import ListingsAdminPage from "./Pages/admin/ListingAdminPage";
import ListingForm from "./Pages/admin/ListingForm";

export const router = createBrowserRouter([
   {
     path: "/",
     element: <Layout />,
     children: [
      {index: true, element: <Home />},
      {path: "search", element: <SearchPage />},
      {path: "register", element: <RegisterPage/>},
      {path: "login", element: <LoginPage />},
      { path: "listing/:id", element: <ListingDetailPage />},

      {
        path: "admin",
        children: [
          {
            index: true, element: <Navigate to="listings" replace />
          },
          {
            path: "listings",
            element: (
              <RequireAdmin>
                <ListingsAdminPage />
              </RequireAdmin>
            )
          },
          {
            path: "listings/new",
            element: (
              <RequireAdmin>
                <ListingForm mode="create" />
              </RequireAdmin>
            )
          },
          {
            path: "listings/:id/edit",
            element: (
              <RequireAdmin>
                <ListingForm mode="edit" />
              </RequireAdmin>
            )
          },
        ]
      },

      {
        path: "account/bookings",
        element: (
          <RequireAuth>
            <MyBookingsPage />
          </RequireAuth>
        )
      },     
      {
        path: "booking/confirm",
        element: (
          <RequireAuth>
            <BookingFlowPage />
          </RequireAuth>
        )
      },
      {
        path: "booking/thanks",
        element: (
          <RequireAuth>
            <BookingThanksPage />
          </RequireAuth>
        )
      },
     ],
    },
   
    { path: "*", element: <Navigate to="/" replace />}
])