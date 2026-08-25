"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs, orderBy, deleteDoc, doc, writeBatch } from "firebase/firestore";

export default function CoachingBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        // Query bookings for this creator, sorted by newest first
        const q = query(
          collection(db, "coachingBookings"),
          where("creatorId", "==", user.uid),
          orderBy("createdAt", "desc") // Newest bookings appear at the top
        );

        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setBookings(data);

        // Automatically mark all fetched unread bookings as read
        const batch = writeBatch(db);
        let hasUnread = false;

        querySnapshot.docs.forEach((docSnap) => {
          const bookingData = docSnap.data();
          if (bookingData.unread === true) {
            batch.update(doc(db, "coachingBookings", docSnap.id), { unread: false });
            hasUnread = true;
          }
        });

        if (hasUnread) {
          await batch.commit();
        }
      } catch (error) {
        console.error("Error fetching coaching bookings:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Function to delete a single booking entry
  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to clear/delete this booking?")) return;

    try {
      await deleteDoc(doc(db, "coachingBookings", bookingId));
      // Remove it from the local state instantly
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading bookings...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">🎯 Coaching Bookings</h1>
        <span className="text-sm text-gray-500">Total: {bookings.length}</span>
      </div>

      {bookings.length === 0 ? (
        <p className="text-gray-500">No coaching bookings found yet.</p>
      ) : (
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white border rounded-xl p-6 shadow-sm flex flex-col gap-4 relative"
            >
              {/* Top Row: Info & Delete Action */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">
                    {booking.coachingTitle || "1 to 1 meet"}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    👤 <strong>Customer Email:</strong> {booking.customerEmail || "N/A"}
                  </p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                    💳 Payment: Success (${booking.amount})
                  </span>
                  <button
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="text-gray-400 hover:text-red-600 transition p-1 text-sm font-bold"
                    title="Clear Booking"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Booking Details Box */}
              <div className="bg-gray-50 border rounded-lg p-4 flex flex-col gap-2 text-sm text-gray-700">
                <div className="font-semibold text-gray-900 flex items-center gap-2">
                  <span>🎯</span> Booking Details
                </div>
                <div>📅 <strong>Scheduled Date:</strong> {booking.scheduledDate}</div>
                <div>🕐 <strong>Scheduled Time:</strong> {booking.scheduledTime}</div>
                <div>⏱️ <strong>Duration:</strong> {booking.duration} minutes</div>
                {booking.meetingLink && (
                  <div>
                    🔗 <strong>Meeting Link:</strong>{" "}
                    <a
                      href={booking.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline font-medium"
                    >
                      Join Meeting Room
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}