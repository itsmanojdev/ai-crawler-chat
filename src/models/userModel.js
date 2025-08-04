import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    photo: {
        type: String,
        default: "/uploads/default_user.jpg"
    }
},
    {
        timestamps: true
    }
)

const userModel = mongoose.models.User || mongoose.model('User', userSchema)

export default userModel