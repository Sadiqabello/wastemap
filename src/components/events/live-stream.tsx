"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Video,
  VideoOff,
  Radio,
  Loader2,
  Maximize2,
  Minimize2,
  Pin,
} from "lucide-react";
import { toggleLiveStream } from "@/lib/actions/events";
import { toast } from "sonner";

interface LiveStreamProps {
  eventId: string;
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
      executeCommand: (command: string, ...args: unknown[]) => void;
      addEventListener: (event: string, handler: (...args: unknown[]) => void) => void;
      getNumberOfParticipants: () => number;
    };
  }
}

export function LiveStream({
  eventId,
  isLive,
  isOrganizer,
  userName,
}: LiveStreamProps) {
  const [live, setLive] = useState(isLive);
  const [toggling, setToggling] = useState(false);
  const [joined, setJoined] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReturnType<typeof window.JitsiMeetExternalAPI.prototype.constructor> | null>(null);

  const jitsiDomain =
    process.env.NEXT_PUBLIC_JITSI_DOMAIN || "meet.ffmuc.net";
  const roomName = `wastemap-${eventId.replace(/-/g, "").slice(0, 20)}`;

  // Load the Jitsi Meet external API script from the configured domain
  useEffect(() => {
    if (typeof window.JitsiMeetExternalAPI !== "undefined") {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://${jitsiDomain}/external_api.js`;
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.head.appendChild(script);
  }, [jitsiDomain]);

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
      startJitsi();
    } else {
      toast.info("Live stream ended.");
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
      setJoined(false);
      setParticipantCount(0);
    }
  }

  function startJitsi() {
    if (!containerRef.current || !scriptLoaded) return;
    if (apiRef.current) {
      apiRef.current.dispose();
    }

    const api = new window.JitsiMeetExternalAPI(jitsiDomain, {
      roomName,
      parentNode: containerRef.current,
      width: "100%",
      height: "100%",
      configOverwrite: {
        startWithAudioMuted: !isOrganizer,
        startWithVideoMuted: !isOrganizer,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        // Pin the host: disable auto tile view for attendees so they see the host prominently
        startInTileView: false,
        toolbarButtons: isOrganizer
          ? [
              "microphone",
              "camera",
              "desktop",
              "chat",
              "raisehand",
              "participants-pane",
              "tileview",
              "fullscreen",
              "hangup",
            ]
          : [
              "microphone",
              "camera",
              "chat",
              "raisehand",
              "tileview",
              "fullscreen",
              "hangup",
            ],
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        DEFAULT_BACKGROUND: "#0f172a",
        TOOLBAR_ALWAYS_VISIBLE: true,
        FILM_STRIP_MAX_HEIGHT: 120,
        DISABLE_VIDEO_BACKGROUND: true,
      },
      userInfo: {
        displayName: isOrganizer ? `${userName} (Host)` : userName,
      },
    });

    // Track participant count
    api.addEventListener("participantJoined", () => {
      setParticipantCount(api.getNumberOfParticipants());
    });
    api.addEventListener("participantLeft", () => {
      setParticipantCount(api.getNumberOfParticipants());
    });

    // When attendee joins, pin the host by setting them as dominant speaker display
    if (!isOrganizer) {
      api.addEventListener("videoConferenceJoined", () => {
        // Execute command to set the view to speaker view (host stays prominent)
        api.executeCommand("setTileView", false);
      });
    }

    apiRef.current = api as unknown as { dispose: () => void };
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
    setParticipantCount(0);
  }

  // Determine the video container height
  const videoHeight = joined
    ? expanded
      ? "h-[70vh] lg:h-[80vh]"
      : "h-[300px] md:h-[450px] lg:h-[550px]"
    : "hidden";

  // Organizer view
  if (isOrganizer) {
    return (
      <Card className={`border-2 ${live ? "border-red-400 shadow-red-100 shadow-lg" : "border-stone-200"}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Video className="h-5 w-5" />
              Live Stream
              {live && (
                <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px]">
                  LIVE
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {live && participantCount > 0 && (
                <span className="text-xs text-stone-500">
                  {participantCount} watching
                </span>
              )}
              {joined && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="h-7 w-7 p-0"
                >
                  {expanded ? (
                    <Minimize2 className="h-4 w-4" />
                  ) : (
                    <Maximize2 className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleToggleLive}
              disabled={toggling || !scriptLoaded}
              variant={live ? "destructive" : "default"}
              className={`flex-1 ${!live ? "bg-red-600 hover:bg-red-700" : ""}`}
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
          </div>

          {!live && !joined && (
            <p className="text-xs text-stone-500">
              Start a live video stream so attendees can watch the cleanup in real time.
            </p>
          )}

          {/* Host pinned indicator */}
          {joined && (
            <div className="flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1.5 text-xs text-emerald-700">
              <Pin className="h-3 w-3" />
              You are pinned as host. Attendees see you prominently.
            </div>
          )}

          {/* Jitsi container */}
          <div
            ref={containerRef}
            className={`overflow-hidden rounded-lg bg-slate-900 ${videoHeight}`}
          />
        </CardContent>
      </Card>
    );
  }

  // Attendee view — only show when live
  if (!live) return null;

  return (
    <Card className="border-2 border-red-400 shadow-red-100 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Video className="h-5 w-5 text-red-500" />
            Live Stream
            <Badge className="bg-red-500 text-white border-0 animate-pulse text-[10px]">
              LIVE
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {joined && participantCount > 0 && (
              <span className="text-xs text-stone-500">
                {participantCount} watching
              </span>
            )}
            {joined && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="h-7 w-7 p-0"
              >
                {expanded ? (
                  <Minimize2 className="h-4 w-4" />
                ) : (
                  <Maximize2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>
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
          className={`overflow-hidden rounded-lg bg-slate-900 ${videoHeight}`}
        />
      </CardContent>
    </Card>
  );
}
