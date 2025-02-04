import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

const AthleteForm = () => {
    const [formData, setFormData] = useState({ name: '', sport: '', age: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
            <input
                type="text"
                name="name"
                placeholder="Athlete Name"
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
            />
            <input
                type="text"
                name="sport"
                placeholder="Sport"
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
            />
            <input
                type="number"
                name="age"
                placeholder="Age"
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
            />
            <Button type="submit">Add Athlete</Button>
        </form>
    );
};

export default AthleteForm;