"use client";

import { CldVideoPlayer } from "next-cloudinary";
import 'next-cloudinary/dist/cld-video-player.css';

interface CloudinaryVideoPlayerProps {
  src: string;
  width?: string;
  height?: string;
  className?: string;
}

const CloudinaryVideoPlayer = ({
  src,
  width = "1920",
  height = "1080",
  className
}: CloudinaryVideoPlayerProps) => {
  return (
    <CldVideoPlayer
      width={width}
      height={height}
      src={src}
      autoplay
      loop
      muted
      controls={false}
      bigPlayButton={false}
      className={className}
    />
  );
};

export default CloudinaryVideoPlayer;