"use client";

import { ShipmentStatus } from "@prisma/client";
import { CheckCircle, Circle, Clock } from "lucide-react";
import { STATUS_LABELS, STATUS_ORDER, formatDateTime } from "@/lib/utils";

interface ShipmentEvent {
  id: string;
  status: ShipmentStatus;
  location: string;
  description: string;
  timestamp: string | Date;
}

interface Props {
  events: ShipmentEvent[];
  currentStatus: ShipmentStatus;
}

export default function TrackingTimeline({ events, currentStatus }: Props) {
  const statusIndex = STATUS_ORDER.indexOf(currentStatus);

  return (
    <div className="space-y-0">
      {STATUS_ORDER.map((status, i) => {
        const event = events.find((e) => e.status === status);
        const done = i <= statusIndex && status !== "ON_HOLD";
        const active = status === currentStatus;

        return (
          <div key={status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  done
                    ? "bg-emerald-500 text-white"
                    : active
                    ? "bg-emerald-100 border-2 border-emerald-500 text-emerald-600"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {done && !active ? (
                  <CheckCircle className="w-5 h-5" />
                ) : active ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <Circle className="w-4 h-4" />
                )}
              </div>
              {i < STATUS_ORDER.length - 1 && (
                <div className={`w-0.5 h-12 my-1 ${i < statusIndex ? "bg-emerald-400" : "bg-gray-200"}`} />
              )}
            </div>

            <div className="pb-8 flex-1">
              <p className={`font-medium text-sm ${done ? "text-gray-900" : "text-gray-400"}`}>
                {STATUS_LABELS[status]}
              </p>
              {event ? (
                <>
                  <p className="text-xs text-gray-500 mt-0.5">{event.location}</p>
                  <p className="text-xs text-gray-500">{event.description}</p>
                  <p className="text-xs text-emerald-600 mt-1">{formatDateTime(event.timestamp)}</p>
                </>
              ) : (
                <p className="text-xs text-gray-400 mt-0.5">Pending</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
