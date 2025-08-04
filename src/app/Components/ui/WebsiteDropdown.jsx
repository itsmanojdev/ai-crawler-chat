"use client";

import { useEffect, useState } from "react";

export default function WebsiteDropdown({ selectedWebsite, onChange }) {
    console.log("selectedWebsite", selectedWebsite);

    const [websites, setWebsites] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWebsites = async () => {
            try {
                const res = await fetch("/api/websites");
                const data = await res.json();
                setWebsites(data);
                if (data.length > 0) {
                    onChange(data[0]._id); // Set initial selection
                }
            } catch (err) {
                console.error("Failed to fetch websites:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchWebsites();
    }, [onChange]);

    return (
        <div>
            <label className="block text-sm font-medium text-sky-600 mb-1">
                Select Website
            </label>
            {loading ? (
                <div className="text-sky-500 text-sm italic">Loading websites...</div>
            ) : (
                <select
                    value={selectedWebsite}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full border border-sky-300 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
                >
                    {websites.map((site) => (
                        <option key={site._id} value={site._id}>
                            {site.website_url}
                        </option>
                    ))}
                </select>
            )}
        </div>
    );
}
