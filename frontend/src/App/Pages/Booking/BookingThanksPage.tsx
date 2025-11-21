import { Link } from "react-router-dom";

export default function BookingThanksPage() {
  return (
    <div className="max-w-2xl mx-auto p-6 text-center space-y-5">
      <h1 className="text-3xl md:text-4xl font-semibold text-white">
        Thank you for your booking!
      </h1>
      <p className="text-white/70">
        We’ve sent a confirmation to your email. You can review your booking details any time.
      </p>

      <div className="flex items-center justify-center gap-3 flex-wrap">
        <Link
          to="/account/bookings"
          className="rounded-xl2 bg-accent hover:bg-accent2 text-[#0f0f10] px-4 py-2"
        >
          View booking details
        </Link>
        <Link
          to="/"
          className="rounded-xl2 bg-white/10 text-white px-4 py-2 hover:bg-white/15"
        >
          Back to main page
        </Link>
      </div>
    </div>
  );
}
