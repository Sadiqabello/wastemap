"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, VideoOff, Radio, Loader2 } from "lucide-react";
import { toggleLiveStream } from "@/lib/actions/events";
import { toast } from "sonner";

interface LiveStreamProps {
  eventId: string;
  eventTitle: string;
  isLive: boolean;
  isOrganizer: boolean;
  userName: string;
}

declare global {
  interface Window {
    JitsiMeetExternalAPI: new (
      domain: string,
      options: Record<string, unknown>
    ) => {
      dispose: () => void;
    };
  }
}

export function LiveStream({
  eventId,
  eventTitle,
  isLive,
  isOrganizer,
  userName,
}: LiveStreamProps) {
  const [live, setLive] = useState(isLive);
  const [toggling, setToggling] = useState(false);
  const [joined, setJoined] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<{ dispose: () => void } | null>(null);

  const roomName = `wastemap-${eventId.replace(/-/g, "").slice(0, 20)}`;

  // Load the Jitsi Meet external API script
  useEffect(() => {
    if (typeof window.JitsiMeetExternalAPI !== "undefined") {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);

    return () => {
      // Don't remove script on unmount — it can be reused
    };
  }, []);

  // Clean up Jitsi instance on unmount
  useEffect(() => {
    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, []);

  async function handleToggleLive() {
    setToggling(true);
    const result = await toggleLiveStream(eventId);
    setToggling(false);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    const newState = result.is_live ?? !live;
    setLive(newState);

    if (newState) {
      toast.success("You are now live! Attendees can join the stream.");
      // Auto-join as organizer
      startJitsi();
    } else {
      toast.info("Live stream ended.");
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      setJoined(false);
    }
  }

  function startJitsi() {
    if (!containerRef.current || !scriptLoaded) return;
    if (apiRef.current) {
      apiRef.current.dispose();
    }

    const api = new window.JitsiMeetExternalAPI("meet.jit.si", {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: 400,
      configOverwrite: {
        startWithAudioMuted: !isOrganizer,
        startWithVideoMuted: !isOrganizer,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        toolbarButtons: isOrganizer
          ? [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "raisehand",
              "participants-pane",
              "tileview",
              "hangup",
            ]
          : [
              "microphone",
              "camera",
              "chat",
              "raisehand",
              "tileview",
              "hangup",
            ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_BACKGROUND: "#1a1a1a",
        TOOLBAR_ALWAYS_VISIBLE: true,
      },
      userInfo: {
        displayName: userName,
      },
    });

    apiRef.current = api;
    setJoined(true);
  }

  function handleJoinStream() {
    startJitsi();
  }

  function handleLeaveStream() {
    if (apiRef.current) {
      apiRef.current.dispose();
      apiRef.current = null;
    }
    setJoined(false);
  }

  // Organizer controls
  if (isOrganizer) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-4 w-4" />
            Live Stream
            {live && (
              <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px]">
                LIVE
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-stone-500">
            {live
              ? "Your event is live. Attendees can join and watch."
              : "Start a live video stream so attendees can watch the cleanup in real time."}
          </p>

          <Button
            onClick={handleToggleLive}
            disabled={toggling || !scriptLoaded}
            variant={live ? "destructive" : "default"}
            className={`w-full ${!live ? "bg-red-600 hover:bg-red-700" : ""}`}
            size="sm"
          >
            {toggling ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : live ? (
              <VideoOff className="mr-2 h-4 w-4" />
            ) : (
              <Radio className="mr-2 h-4 w-4" />
            )}
            {toggling
              ? "Updating..."
              : live
                ? "End Live Stream"
                : "Go Live"}
          </Button>

          {/* Jitsi container */}
          <div
            ref={containerRef}
            className={`overflow-hidden rounded-lg ${joined ? "" : "hidden"}`}
          />
        </CardContent>
      </Card>
    );
  }

  // Attendee view
  if (!live) return null;

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Video className="h-4 w-4 text-red-500" />
          Live Stream
          <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px]">
            LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!joined ? (
          <>
            <p className="text-xs text-stone-500">
              This event is streaming live! Join to watch the cleanup in progress.
            </p>
            <Button
              onClick={handleJoinStream}
              disabled={!scriptLoaded}
              className="w-full bg-red-600 hover:bg-red-700"
              size="sm"
            >
              {!scriptLoaded ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Video className="mr-2 h-4 w-4" />
              )}
              {scriptLoaded ? "Join Live Stream" : "Loading..."}
            </Button>
          </>
        ) : (
          <Button
            onClick={handleLeaveStream}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <VideoOff className="mr-2 h-4 w-4" />
            Leave Stream
          </Button>
        )}

        {/* Jitsi container */}
        <div
          ref={containerRef}
          className={`overflow-hidden rounded-lg ${joined ? "" : "hidden"}`}
        />
      </CardContent>
    </Card>
  );
}
