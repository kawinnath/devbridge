"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/components/ThemeContext";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  type: "developer" | "client" | "project";
}

export default function NetworkBackground() {
  const { theme } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Respect prefers-reduced-motion
    const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Build developer, client, and project nodes
    const nodes: Node[] = [];
    const nodeCount = Math.min(42, Math.max(16, Math.floor((width * height) / 32000)));

    const types: ("developer" | "client" | "project")[] = ["developer", "project", "client"];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.14, // Ultra-smooth slow movement
        vy: prefersReducedMotion ? 0 : (Math.random() - 0.5) * 0.14,
        radius: Math.random() * 1.8 + 1.4,
        type: types[i % 3],
      });
    }

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const getColors = () => {
      const isDark = theme === "dark";
      return {
        lineBase: isDark ? "rgba(99, 102, 241, 0.04)" : "rgba(79, 70, 229, 0.035)",
        lineConnection: isDark ? "rgba(6, 182, 212, 0.055)" : "rgba(8, 145, 178, 0.045)",
        developer: isDark ? "rgba(139, 92, 246, 0.28)" : "rgba(124, 58, 237, 0.18)", // Electric violet
        project: isDark ? "rgba(6, 182, 212, 0.28)" : "rgba(8, 145, 178, 0.18)",     // Cyan
        client: isDark ? "rgba(16, 185, 129, 0.28)" : "rgba(16, 185, 129, 0.18)",    // Emerald
        core: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(9, 13, 26, 0.8)",
      };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const colors = getColors();

      // Update positions and render nodes
      nodes.forEach((node) => {
        if (!prefersReducedMotion) {
          node.x += node.vx;
          node.y += node.vy;

          if (node.x < 0 || node.x > width) node.vx *= -1;
          if (node.y < 0 || node.y > height) node.vy *= -1;
        }

        // Ambient halo
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 3.2, 0, Math.PI * 2);
        ctx.fillStyle = colors[node.type];
        ctx.fill();

        // Node center
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.core;
        ctx.fill();
      });

      // Subtle connection lines between nodes within distance
      const maxDistance = 145;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);

          if (dist < maxDistance) {
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            const isTripartite = (n1.type === "developer" && n2.type === "project") || (n1.type === "project" && n2.type === "client");
            ctx.strokeStyle = isTripartite ? colors.lineConnection : colors.lineBase;
            ctx.lineWidth = 0.65 * (1 - dist / maxDistance);
            ctx.stroke();
          }
        }
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(draw);
      }
    };

    draw();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 block transition-opacity duration-700"
      style={{ opacity: 0.85 }}
    />
  );
}
