"use client";

import { useEffect } from 'react';
import { useDateStore } from '@/lib/store';

export default function DynamicTitle() {
  const { selectedMonthIndex, selectedYear } = useDateStore();

  // Function to update favicon using existing calendar images
  const updateFavicon = (iconPath: string) => {
    let link = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
    
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    
    link.href = iconPath;
  };

  // Function to get the correct calendar image path for a given day
  const getCalendarImagePath = (day: number): string => {
    return `/img/calendar_${day}_2x.png`;
  };

  useEffect(() => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthName = monthNames[selectedMonthIndex];
    const title = `Google Calendar - ${monthName} ${selectedYear}`;
    
    // Update the document title
    document.title = title;
    
    // Update favicon with current day using existing images
    const today = new Date();
    const currentDay = today.getDate();
    const faviconPath = getCalendarImagePath(currentDay);
    updateFavicon(faviconPath);
    
  }, [selectedMonthIndex, selectedYear]);

  // Also update favicon on component mount and daily
  useEffect(() => {
    const updateDailyFavicon = () => {
      const today = new Date();
      const currentDay = today.getDate();
      const faviconPath = getCalendarImagePath(currentDay);
      updateFavicon(faviconPath);
    };

    // Update immediately
    updateDailyFavicon();

    // Update daily at midnight
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    const msUntilMidnight = tomorrow.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      updateDailyFavicon();
      
      // Set up daily interval
      const intervalId = setInterval(updateDailyFavicon, 24 * 60 * 60 * 1000);
      
      return () => clearInterval(intervalId);
    }, msUntilMidnight);

    return () => clearTimeout(timeoutId);
  }, []);

  return null; // This component doesn't render anything visible
}