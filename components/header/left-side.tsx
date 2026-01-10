"use client";

import React from "react";
import Image from "next/image";
import { useToggleSideBarStore } from "@/lib/store";
import dayjs from "dayjs";

export default function HeaderLeft() {
  const todaysDate = dayjs();
  const setSideBarOpen = useToggleSideBarStore((state) => state.setSideBarOpen);

  return (
    <div className="gb_Rd gb_qd gb_rd" style={{ minWidth: '238px', display: 'flex', alignItems: 'center', height: '48px', fontFamily: '"Google Sans Text",Roboto,Helvetica,Arial,sans-serif' }}>
      {/* Hamburger Menu */}
      <div
        className="gb_1c"
        onClick={() => setSideBarOpen()}
        style={{
          width: '58px',
          height: '58px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          cursor: 'pointer'
        }}
        role="button"
        tabIndex={0}
        aria-label="Main drawer"
      >
        <svg focusable="false" viewBox="0 0 24 24" style={{ width: '24px', height: '24px', fill: 'currentColor' }}>
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
        </svg>
      </div>

      {/* Calendar Logo and Text */}
      <div className="gb_Tc" style={{ display: 'flex', alignItems: 'center' }}>
        <div className="gb_Uc gb_ie" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="gb_Vc" aria-label="Calendar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Image
              src={`/img/calendar_${todaysDate.date().toString()}_2x.png`}
              width={42}
              height={42}
              alt=""
              className="gb_0c gb_9d"
              style={{ width: '40px', height: '40px' }}
              aria-hidden="true"
              role="presentation"
            />
            <span 
              className="gb_Pd gb_pd" 
              role="heading" 
              aria-level={1}
              style={{
                fontSize: '23px',
                fontWeight: 400,
                letterSpacing: '0',
                lineHeight: '24px',
                color: 'var(--gm3-sys-color-on-surface, #e3e3e3)',
                fontFamily: '"Google Sans",Roboto,Arial,sans-serif'
              }}
            >
              Calendar
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}
