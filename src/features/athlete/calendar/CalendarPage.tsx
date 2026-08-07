import { useEffect, useState } from "react";

import CalendarHero from "./components/CalendarHero";
import MonthlyCalendar from "./components/MonthlyCalendar";
import UpcomingEvents from "./components/UpcomingEvents";
import AddEventCard from "./components/AddEventCard";

import type { CalendarEvent } from "./components/AddEventCard";

import { auth } from "@/services/firebase/firebase";
import {
  getCalendarEvents,
  updateCalendarEvent,
} from "@/services/firebase/calendar";

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Event currently being edited
  const [editingEvent, setEditingEvent] =
    useState<CalendarEvent | null>(null);

  useEffect(() => {
    const loadEvents = async () => {
      const user = auth.currentUser;

      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const calendarEvents =
          await getCalendarEvents(user.uid);

        setEvents(calendarEvents);
      } catch (error) {
        console.error(
          "Failed to load calendar events:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, []);

  /* -----------------------------
     Add Event
  ----------------------------- */

  const handleAddEvent = (
    event: CalendarEvent
  ) => {
    setEvents((currentEvents) => [
      ...currentEvents,
      event,
    ]);
  };

  /* -----------------------------
     Delete Event
  ----------------------------- */

  const handleEventDeleted = (
    eventId: string
  ) => {
    setEvents((currentEvents) =>
      currentEvents.filter(
        (event) => event.id !== eventId
      )
    );
  };

  /* -----------------------------
     Start Editing Event
  ----------------------------- */

  const handleEditEvent = (
    event: CalendarEvent
  ) => {
    setEditingEvent(event);

    document
      .getElementById("add-event")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  /* -----------------------------
     Update Event
  ----------------------------- */

  const handleUpdateEvent = async (
    updatedEvent: CalendarEvent
  ) => {
    const user = auth.currentUser;

    if (!user || !updatedEvent.id) {
      return;
    }

    try {
      await updateCalendarEvent(
        user.uid,
        updatedEvent.id,
        {
          title: updatedEvent.title,
          type: updatedEvent.type,
          date: updatedEvent.date,
          time: updatedEvent.time,
          notes: updatedEvent.notes,
        }
      );

      setEvents((currentEvents) =>
        currentEvents.map((event) =>
          event.id === updatedEvent.id
            ? updatedEvent
            : event
        )
      );

      setEditingEvent(null);
    } catch (error) {
      console.error(
        "Failed to update calendar event:",
        error
      );
    }
  };

  return (
    <div className="space-y-8">
      <CalendarHero
        totalEvents={events.length}
        upcomingEvents={
          events.filter((event) => {
            const today = new Date();

            today.setHours(0, 0, 0, 0);

            const eventDate = new Date(
              `${event.date}T00:00:00`
            );

            return eventDate >= today;
          }).length
        }
        competitionEvents={
          events.filter(
            (event) => event.type === "Competition"
          ).length
        }
        onAddEvent={() => {
          document
            .getElementById("add-event")
            ?.scrollIntoView({
              behavior: "smooth",
            });
          }}
        />

      <MonthlyCalendar
        events={events}
        loading={loading}
      />

      <UpcomingEvents
        events={events}
        loading={loading}
        onEventDeleted={handleEventDeleted}
        onEventEdit={handleEditEvent}
      />

      <div id="add-event">
        <AddEventCard
          onAddEvent={handleAddEvent}
          editingEvent={editingEvent}
          onUpdateEvent={handleUpdateEvent}
        />
      </div>
    </div>
  );
}