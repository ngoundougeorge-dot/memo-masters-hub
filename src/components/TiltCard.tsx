import React from "react";

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  specular?: boolean;
}

export function TiltCard({
  children,
  className = "",
  maxTilt: _maxTilt,
  specular: _specular,
  ...props
}: TiltCardProps) {
  return (
    <div
      className={`relative ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export default TiltCard;

