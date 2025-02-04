import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const AthleteList = ({ athletes }) => {
    return (
        <div className="p-4 space-y-4">
            {athletes.map((athlete, index) => (
                <Card key={index}>
                    <CardContent>
                        <h3 className="text-lg font-bold">{athlete.name}</h3>
                        <p>Sport: {athlete.sport}</p>
                        <p>Age: {athlete.age}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default AthleteList;