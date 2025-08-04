import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";
import { NextResponse } from "next/server";
import userModel from "../../../models/userModel";

export async function GET() {
    try {
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
    const formData = await req.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const image = formData.get("image");
    let filename

    if (!name || !email) {
        return NextResponse.json({ error: "Missing Name/Email fields" }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (image && !allowedTypes.includes(image.type)) {
        return NextResponse.json({ error: "Invalid image type. Allowed types: JPG, PNG, JPEG." }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
        if (image) {
            filename = await imageUpload(image)
            existingUser.photo = `/uploads/${filename}`
            await existingUser.save()
        }
        return NextResponse.json({ user: existingUser });
    }
    if (image) {
        filename = await imageUpload(image)
    }

    // Save new user
    const newUser = await userModel.create({
        name,
        email,
        photo: image ? `/uploads/${filename}` : "/uploads/default_user.jpg",
    });

    return NextResponse.json({ user: newUser });
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