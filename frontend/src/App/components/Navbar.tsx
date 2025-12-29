import { Link, NavLink, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../lib/auth"
import SearchBar from "./search/SearchBar"
import { useEffect, useState } from "react"
import SearchOverlay from "./search/SearchOverlay"
import { createPortal } from "react-dom";
import { Menu, Search, X } from "lucide-react"

export default function Navbar(){
  const {user, logout} = useAuth()
  const navigate = useNavigate()

  const [overlayOpen, setOverlayOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
    

  function onLogout(): void {
    logout()
    navigate("/")
  }

  function handleFinishSearch(params: string) {
    setOverlayOpen(false)
    navigate(`/search?${params}`)
  }

  const location = useLocation();
    useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

return (
  <header className="sticky z-50 top-0 mt-2  backdrop-blur">
    <div className="container mx-auto px-4 md:h-16 flex items-center gap-3">
      <Link to="/" className="flex items-center font-semibold tracking-wide text-accent flex-shrink-0">
        <img
          src="/Avatar.png"
          alt="Vintage Resorts logo"
          className="h-8 w-auto"
        />
      </Link>
        <div className="hidden mt-4 lg:flex flex-1 justify-center">
          <div className="w-full max-w-2xl">
            <SearchBar />
          </div>
        </div>
          <nav className="hidden xl:flex items-center gap-4 text-sm whitespace-nowrap flex-shrink-0" >
            {user ? (
            <>
              <NavLink 
                to="/account/bookings"
                className={({ isActive }) => (isActive ? "underline" : undefined)}
              >
                 My Booking
              </NavLink>
                {user && (
              <NavLink
                 to="/account/listings"
                 className={({ isActive }) => (isActive ? "underline" : undefined)}
                 >
                  My Listings
              </NavLink>
                )}

                <button 
                 onClick={onLogout} 
                 className="btn"
                 >
                 Logout
                </button>
                    </>
                ) : (
                 <>
                <NavLink 
                  to="/login"
                  className={({ isActive }) => (isActive ? "underline" : undefined)}
                  >
                   Login
                </NavLink>
                <NavLink 
                   to="/register" 
                   className="btn"
                    >
                    Create account
                </NavLink>
            </>
                )}         
            </nav> 
            <button className="lg:hidden flex-1 inline-flex items-center justify-between h-10 rounded-2xl bg-surface border border-white/20 px-4 text-left hover:bg-white/5"
              onClick={() => setOverlayOpen(true)}
              aria-label="Open search"
            >
                <div className="min-w-0 pr-3">
                    <span className="block text-sm text-white font-medium truncate"> Where to?</span>
                    <span className="block text-[11px] text-white/60 truncate"> Add dates . Add guests</span>
                </div>
                <span className="btn inline-flex items-center gap-1 text-xs">
                    <Search className="h-4 w-4"/>
                    Search
                </span>
            </button>
            
          <button
            type="button"
            className="xl:hidden ml-2 inline-flex items-center justify-center rounded-xl border border-white/15 h-10 w-10 hover:bg-white/5"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav-panel"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? (<X className="h-5 w-5" aria-label="Close" />
            ) : (
            <Menu className="h-5 w-5 " />
            )}
          </button>
      </div>

      {/* Mobile slide-over menu */}
      
      <div
        id="mobile-nav-panel"
        className={`xl:hidden  fixed inset-y-0 right-0 z-[60] w-80 max-w-[85vw] bg-surface/95 backdrop-blur border-l border-white/10 shadow-2xl transition-transform duration-300 ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b  border-white/10">
          <span className="text-sm font-medium">Menu</span>
          <button
            className="inline-flex items-center justify-center rounded-xl border border-white/15 h-9 w-9 hover:bg-white/5"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-4 space-y-2 text-sm bg-black">
          <NavLink to="/search" className="block rounded-lg px-3 py-2 hover:bg-white/5" onClick={() => setMobileOpen(false)}>
            Search
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/account/bookings"
                className="block rounded-lg px-3 py-2 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
             >
                My Booking
              </NavLink>

              {user && (
               <NavLink
                  to="/account/listings"
                  className="block rounded-lg px-3 py-2 hover:bg-white/5"
                  onClick={() => setMobileOpen(false)}
                >
                  My Listing
               </NavLink>
              )}

              <button className="btn w-full mt-2" onClick={onLogout}>
                Logout
              </button>
            </>
           ) : (
            <>
              <NavLink
                to="/login"
                className="block rounded-lg px-3 py-2 hover:bg-white/5"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </NavLink>
              <NavLink to="/register" className="btn w-full" onClick={() => setMobileOpen(false)}>
                Create account
              </NavLink>
            </>
          )}
        </div>
      </div>

      {/* Search overlay portal */}
      {overlayOpen &&
        createPortal(
              <SearchOverlay onClose={() => setOverlayOpen(false)} onFinish={handleFinishSearch} />,
          document.body
        )}
  </header>
  )
}