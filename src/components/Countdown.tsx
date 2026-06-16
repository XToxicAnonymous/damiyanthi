/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, ArrowRight, Download } from "lucide-react";
import { motion } from "motion/react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export default function Countdown() {
  const targetDate = new Date("2026-06-18T18:00:00+05:30"); // 6:00 PM India Standard Time
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: false
  });

  useEffect(() => {
    function calculateTime() {
      const now = new Date();
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 65);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeRemaining({ days, hours, minutes, seconds, isPast: false });
    }

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDownloadCalendar = () => {
    const calendarData = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Damiyanthi Poliyath Memorial/NONSGML//EN",
      "BEGIN:VEVENT",
      "UID:damiyanthi-prayer-meet-2026",
      "DTSTAMP:20260614T000000Z",
      "DTSTART:20260618T123000Z", // 12:30 UTC is 18:00 IST
      "DTEND:20260618T143000Z",
      "SUMMARY:Prayer Meet of Damiyanthi Poliyath",
      "DESCRIPTION:We invite you for a small prayer meet of our loving Mother and Grandmother Damiyanthi Poliyath.",
      "LOCATION:Shubh Kalash Society, 5th floor 503, Sec-35, Kamothe",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([calendarData], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "Damiyanthi_Poliyath_Prayer_Meet.ics");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="countdown-widget" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="max-w-3xl mx-auto text-center">
        <span className="text-stone-500 dark:text-stone-400 font-mono text-xs uppercase tracking-widest block mb-2">Memorial Ceremony</span>
        <h2 className="font-serif text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-tight mb-4">Prayer Meet & Remembrance</h2>
        
        <p className="text-stone-600 dark:text-stone-300 font-sans leading-relaxed max-w-xl mx-auto mb-8 text-xs md:text-sm">
          The Poliyath family invites you for a quiet prayer meet of our beloved mother and grandmother. Your presence and prayers mean everything to us.
        </p>

        {/* Time counter dials */}
        {!timeRemaining.isPast ? (
          <div className="relative mb-10 max-w-3xl mx-auto">
            <div className="grid grid-cols-4 gap-1.5 xs:gap-3 sm:gap-4 md:gap-5 text-center relative">
              {[
                { 
                  label: "Days", 
                  value: timeRemaining.days, 
                  percent: Math.min(100, (timeRemaining.days / 30) * 100),
                  techCode: "D_01",
                  sysTag: "T_SYNC"
                },
                { 
                  label: "Hours", 
                  value: timeRemaining.hours, 
                  percent: (timeRemaining.hours / 24) * 100,
                  techCode: "H_02",
                  sysTag: "ACTIVE"
                },
                { 
                  label: "Mins", 
                  value: timeRemaining.minutes, 
                  percent: (timeRemaining.minutes / 60) * 100,
                  techCode: "M_03",
                  sysTag: "CALIBR"
                },
                { 
                  label: "Secs", 
                  value: timeRemaining.seconds, 
                  percent: (timeRemaining.seconds / 60) * 100,
                  techCode: "S_04",
                  sysTag: "LIVE_STREAM"
                }
              ].map((dial, idx) => {
                const radius = 24;
                const strokeWidth = 2.2;
                const circumference = 2 * Math.PI * radius; // ~150.8
                const strokeDashoffset = circumference - (circumference * dial.percent) / 100;

                return (
                  <div 
                    key={idx} 
                    className="gpu-accelerated bg-stone-50/90 dark:bg-stone-950/70 border border-stone-200 dark:border-stone-850/90 rounded-xl p-1.5 xs:p-2.5 sm:p-4 shadow-xs relative overflow-hidden group backdrop-blur-md flex flex-col items-center justify-between min-h-[94px] xs:min-h-[110px] sm:min-h-[128px] md:min-h-[145px] transition-all duration-300 hover:border-amber-500/40 hover:shadow-[0_0_15px_rgba(245,158,11,0.1)] bg-tech-grid"
                  >
                    {/* Laser crosshair corner line decorations */}
                    <div className="absolute top-1 left-1 w-1.5 h-1.5 border-t border-l border-stone-300 dark:border-stone-700 pointer-events-none group-hover:border-amber-500/60 transition-colors duration-300" />
                    <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-stone-300 dark:border-stone-700 pointer-events-none group-hover:border-amber-500/60 transition-colors duration-300" />
                    <div className="absolute bottom-1 left-1 w-1.5 h-1.5 border-b border-l border-stone-300 dark:border-stone-700 pointer-events-none group-hover:border-amber-500/60 transition-colors duration-300" />
                    <div className="absolute bottom-1 right-1 w-1.5 h-1.5 border-b border-r border-stone-300 dark:border-stone-700 pointer-events-none group-hover:border-amber-500/60 transition-colors duration-300" />

                    {/* Left corner status identifier */}
                    <span className="absolute top-1 md:top-2 left-1.5 md:left-2.5 font-mono text-[5.5px] min-[360px]:text-[6.5px] sm:text-[7.5px] md:text-[8px] text-stone-400 dark:text-stone-600 tracking-normal select-none uppercase">
                      {dial.techCode}
                    </span>

                    {/* Right corner active subsystem ping */}
                    <div className="absolute top-1 md:top-2 right-1.5 md:right-2.5 flex items-center gap-0.5 md:gap-1 select-none">
                      <span className="w-1 h-1 rounded-full bg-amber-500 dark:bg-amber-450 animate-pulse" />
                      <span className="hidden min-[350px]:inline font-mono text-[5px] sm:text-[6.5px] md:text-[7px] text-stone-350 dark:text-stone-500 tracking-wider">
                        {dial.sysTag}
                      </span>
                    </div>

                    <div className="w-full flex-grow flex items-center justify-center my-0.5 sm:my-1.5 relative">
                      {/* Responsive Dial Indicator */}
                      <div className="relative w-10 h-10 min-[380px]:w-12 min-[380px]:h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center">
                        <svg viewBox="0 0 60 60" className="absolute inset-0 w-full h-full transform -rotate-90">
                          {/* Inner clean guide ring */}
                          <circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            stroke="rgba(245, 158, 11, 0.04)" 
                            strokeWidth="1" 
                            fill="none" 
                            className="dark:stroke-stone-900"
                          />
                          {/* Hollow dynamic tracking background bar */}
                          <circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            stroke="rgba(0, 0, 0, 0.02)" 
                            strokeWidth={strokeWidth} 
                            fill="none"
                            className="dark:stroke-stone-950/40"
                          />
                          {/* Real-time laser countdown track segment */}
                          <motion.circle 
                            cx="30" 
                            cy="30" 
                            r={radius} 
                            stroke="#f59e0b" 
                            strokeWidth={strokeWidth} 
                            strokeLinecap="round"
                            fill="none"
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{
                              strokeDasharray: circumference,
                              willChange: "stroke-dashoffset"
                            }}
                            className="filter drop-shadow-[0_0_2px_rgba(245,158,11,0.2)] dark:drop-shadow-[0_0_4px_rgba(245,158,11,0.5)] duration-300"
                          />
                          {/* Outer dotted laser calibration ring orbiting details */}
                          <circle 
                            cx="30" 
                            cy="30" 
                            r={radius + 3} 
                            stroke="rgba(245,158,11,0.12)" 
                            strokeWidth="0.8" 
                            strokeDasharray="2 3" 
                            fill="none"
                            className="animate-spin-optimized"
                          />
                        </svg>

                        {/* Centered counter data digits */}
                        <div className="relative z-10 flex flex-col items-center justify-center select-none gpu-accelerated">
                          <span className="font-mono text-xs xs:text-sm sm:text-base md:text-lg font-semibold text-stone-850 dark:text-stone-100 tabular-nums leading-none tracking-tight glitch-text">
                            {String(dial.value).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Telemetry Dial Bottom Indicator */}
                    <div className="w-full text-center select-none uppercase">
                      <span className="text-[7.5px] sm:text-[8px] md:text-[9.5px] text-stone-400 dark:text-stone-500 font-sans uppercase tracking-widest block font-medium group-hover:text-amber-500/80 transition-colors duration-300">
                        {dial.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro Cybernetic status noise below the grid to align layout elegance */}
            <div className="w-full flex items-center justify-between mt-3 px-1.5 select-none opacity-40 font-mono text-[6px] sm:text-[7px] text-stone-400 dark:text-stone-550">
              <span>NTP_REMOTE_CLOCK // SECURE_SSL_SYNC</span>
              <span className="animate-pulse">MEMORIAL_ACTIVE_PING // 120Hz_MONITOR</span>
            </div>
          </div>
        ) : (
          <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 rounded-xl p-4 max-w-md mx-auto mb-8 text-stone-700 dark:text-stone-300 font-sans text-xs md:text-sm">
            🌿 "Remembering a beautiful lifetime. The live prayer event has quietly commenced."
          </div>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-stone-50/50 dark:bg-stone-950/30 border border-stone-150 dark:border-stone-850 rounded-xl p-6 text-left shadow-3xs mb-6">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg text-amber-800 dark:text-amber-550 border border-stone-100 dark:border-stone-800 filter drop-shadow-xs">
              <Calendar size={18} />
            </div>
            <div>
              <h4 className="text-stone-900 dark:text-stone-100 font-serif text-xs md:text-sm font-medium">Date</h4>
              <p className="text-stone-600 dark:text-stone-350 text-xs mt-1">Thursday, June 18, 2026</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg text-amber-800 dark:text-amber-550 border border-stone-100 dark:border-stone-800 filter drop-shadow-xs">
              <Clock size={18} />
            </div>
            <div>
              <h4 className="text-stone-900 dark:text-stone-100 font-serif text-xs md:text-sm font-medium">Time</h4>
              <p className="text-stone-600 dark:text-stone-350 text-xs mt-1">6:00 PM India Standard Time</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="p-2 bg-white dark:bg-stone-900 rounded-lg text-amber-800 dark:text-amber-550 border border-stone-100 dark:border-stone-800 filter drop-shadow-xs">
              <MapPin size={18} />
            </div>
            <div>
              <h4 className="text-stone-900 dark:text-stone-100 font-serif text-xs md:text-sm font-medium">Venue</h4>
              <p className="text-stone-600 dark:text-stone-350 text-xs mt-1 leading-normal">
                Shubh Kalash Society, 5th Floor, Apt 503, Sec-35, Kamothe, Navi Mumbai
              </p>
            </div>
          </div>
        </div>

        {/* Fast Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="ics-download-btn"
            onClick={handleDownloadCalendar}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-800 hover:bg-stone-900 dark:bg-amber-500 dark:hover:bg-amber-600 text-stone-100 dark:text-stone-950 font-sans text-xs font-semibold rounded-lg shadow-sm transition-all cursor-pointer w-full sm:w-auto justify-center"
          >
            <Download size={14} />
            Add to Calendar (.ics)
          </button>
          
          <a
            href="https://www.google.com/maps/search/?api=1&query=Shubh+Kalash+Society+Sec-35+Kamothe"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-stone-50 dark:bg-stone-800 dark:hover:bg-stone-750 border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-200 font-sans text-xs font-semibold rounded-lg shadow-2xs transition-all w-full sm:w-auto justify-center"
          >
            <ArrowRight size={14} className="text-stone-400 dark:text-stone-500" />
            Get Directions via Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
