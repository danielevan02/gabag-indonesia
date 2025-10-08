"use client";

import { useEffect, useState } from "react";

export function CountDown({ time }: { time: Date | string | number }) {
  const targetDate = new Date(time).getTime();
  const [timeLeft, setTimeLeft] = useState(targetDate - Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(targetDate - Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft <= 0) {
    return <div className="uppercase text-xl">This Campaign Is Over</div>;
  }

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const format = (num: number) => String(num).padStart(2, "0")
  return (
    <div className="flex items-center">
      <div className="count-down">
        {format(days)} 
        <span className="text-xs font-normal">days</span>
      </div>
      <span className="font-bold text-3xl">:</span>
      <div className="count-down">
        {format(hours)}
        <span className="text-xs font-normal">hours</span>
      </div>
      <span className="font-bold text-3xl">:</span>
      <div className="count-down">
        {format(minutes)}
        <span className="text-xs font-normal">minutes</span>
      </div>
      <span className="font-bold text-3xl">:</span>
      <div className="count-down">
        {format(seconds)}
        <span className="text-xs font-normal">seconds</span>
      </div>
    </div>
  );
}
