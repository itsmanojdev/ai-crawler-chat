"use client";

import { useEffect, useState } from "react";
import React from 'react'
import Image from 'next/image'

const UserFormPage = () => {
    const [user, setUser] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const stored = localStorage.getItem("chatUser");
        if (stored) setUser(JSON.parse(stored));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email) return;

        setSaving(true);

        const formData = new FormData();
        formData.append("name", name);
        formData.append("email", email);
        if (image) {
            formData.append("image", image);
        }
        console.log(formData);

        const res = await fetch("/api/user", {
            method: "POST",
            body: formData,
        });

        const data = await res.json();
        console.log("response", data);
        if (data?.error) {
            setError(data.error)
        }
        if (data?.user) {
            // Save to localStorage (or cookies)
            localStorage.setItem("chatUser", JSON.stringify(data.user));
            window.location.href = "/chat";
        }

        setSaving(false);
    };

    return (
        <div className="flex flex-col gap-4 mt-6">
            <form
                onSubmit={handleSubmit}
                className="self-center bg-white p-6 rounded-2xl shadow-lg w-150 border border-sky-200"
            >
                <h2 className="text-xl font-semibold text-sky-600 mb-4">Profile</h2>
                {user && (
                    <div className="flex gap-2 bg-sky-100 border border-sky-400 text-sky-700 text-sm px-4 py-3 mb-4 rounded">
                        <div className="size-15">
                            <Image
                                src={user.photo}
                                alt={user.name}
                                className="size-full rounded-full object-cover"
                                width={40} height={40}
                            />
                        </div>
                        <div>
                            <span className="block">Current Logged In</span>
                            <span className="block">User: {user.name}</span>
                            <span className="block">Email: {user.email}</span>
                        </div>
                    </div>
                )}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                )}

                <label className="block mb-2 text-sky-600 ast">Name</label>
                <input
                    type="text"
                    required
                    className="w-full mb-4 border border-sky-300 rounded px-3 py-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />

                <label className="block mb-2 text-sky-600 ast">Email</label>
                <input
                    type="email"
                    required
                    className="w-full mb-4 border border-sky-300 rounded px-3 py-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <label className="block mb-2 text-sky-600">Profile Photo</label>
                <input
                    type="file"
                    accept="image/*"
                    className="w-full mb-4"
                    onChange={(e) => setImage(e.target.files[0])}
                />

                <button
                    type="submit"
                    disabled={saving}
                    className="w-full bg-sky-500 hover:bg-sky-600 text-white font-medium py-2 px-4 rounded"
                >
                    {saving ? "Saving..." : "Save and Continue"}
                </button>
            </form>
        </div>
    );
}

export default UserFormPage

