"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { CloudSun } from "lucide-react";

interface WeatherCardProps {
    location: string;
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
}

export function WeatherCard({ location, temperature, condition, humidity, windSpeed }: WeatherCardProps) {
    return (
        <Card className="w-full max-w-xs bg-linear-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg backdrop-blur-sm">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium text-blue-400">
                    <CloudSun className="w-4 h-4" /> Weather in {location}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-baseline justify-between">
                    <span className="text-4xl font-bold">{Math.round(temperature)}°c</span>
                    <span className="text-sm capitalize text-muted-foreground">{condition}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="flex flex-col bg-background/40 p-2 rounded-lg border border-white/5">
                        <span>Humidity</span>
                        <span className="font-semibold text-foreground">{humidity}%</span>
                    </div>
                    <div className="flex flex-col bg-background/40 p-2 rounded-lg border border-white/5">
                        <span>Wind</span>
                        <span className="font-semibold text-foreground">{windSpeed} km/h</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
