import React from 'react';
import { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { Actor } from "../data/mockData";

interface ActorCardProps {
  actor: Actor;
}

export function ActorCard({ actor }: ActorCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="group cursor-pointer hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden bg-card border-border">
        <CardContent className="p-0">
          {/* Photo */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <div className={`absolute inset-0 bg-muted animate-pulse ${imageLoaded ? 'hidden' : ''}`} />
            <img
              src={actor.photo}
              alt={actor.name}
              className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>
          
          {/* Content */}
          <div className="p-4 text-center">
            <h4 className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {actor.name}
            </h4>
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {actor.character}
            </p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}