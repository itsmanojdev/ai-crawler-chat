import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { NextResponse } from "next/server";
import userModel from "../../../models/userModel";
import { connectdb } from "../../../lib/mongodb";
import { put } from '@vercel/blob';
import { ALLOWED_IMG_TYPES } from "@/constants";

export async function GET() {
    try {
        await connectdb()
        const users = await userModel.find({});

        const totalUsers = users.length - 1; // Subtracting Guest User
        const totalQueries = users.reduce((acc, user) => acc + (user.queries || 0), 0);

        return NextResponse.json({
            totalUsers,
            totalQueries,
        });
    } catch (err) {
        console.error('Analytics Fetch Error:', err);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await connectdb()
        const formData = await req.formData();
        const name = formData.get("name");
        const email = formData.get("email");
        const image = formData.get("image");
        let filename

        // Validation
        if (!name || !email) {
            return NextResponse.json({ error: "Missing Name/Email fields" }, { status: 400 });
        }

        if (!ALLOWED_IMG_TYPES.includes(image.type)) {
            return NextResponse.json({ error: "Invalid image type. Allowed types: JPG, PNG, JPEG." }, { status: 400 });
        }

        // Check if user already exists
        let imageURL = "";
        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            if (image) {
                imageURL = await imageUploadVercel(image)
                existingUser.photo = imageURL;
                await existingUser.save();
            }
            return NextResponse.json({ user: existingUser });
        }

        if (image) {
            imageURL = await imageUploadVercel(image)
        }

        // Save new user
        const newUser = await userModel.create({
            name,
            email,
            photo: image ? imageURL : "/uploads/default_user.jpg",
        });

        return NextResponse.json({ user: newUser });
    } catch (err) {
        console.log('User Form Error:', err);
        return NextResponse.json({ error: 'Server Error' }, { status: 500 });
    }
}

const imageUpload = async (image) => {
    try {
        // Handle image upload
        const buffer = Buffer.from(await image.arrayBuffer());
        const filename = `${uuid()}_${image.name}`;
        const filepath = path.join(process.cwd(), "public/uploads", filename);
        await writeFile(filepath, buffer);
        return filename
    } catch (error) {
        console.log("Image upload fail: ", error);
        return NextResponse.json({ error: "Image upload fail" }, { status: 400 });
    }
}

const imageUploadVercel = async (image) => {
    // Handle image upload
    const blob = await put(`profiles/${image.name}`, image, {
        access: 'public',
        addRandomSuffix: true,
    });

    return blob.url
}