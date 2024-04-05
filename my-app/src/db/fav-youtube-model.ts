import { Schema, model } from "mongoose"

export interface IFavYoutubeSchema {
    title: string;
    description: string;
    thumbnailUrl?: string;
    watched: boolean;
    youtubeName: string;
}

const FavYoutuberSchema = new Schema<IFavYoutubeSchema>({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    thumbnailUrl: {
        type: String,
        default: "ashdjanlksdlasldlna"
    },
    watched: {
        type: Boolean,
        default: false,
        required: true
    },
    youtubeName: {
        type: String,
        required: true
    }
})

const FavYoutubeVideosModel = model('fav-youtube-videos', FavYoutuberSchema)

export default FavYoutubeVideosModel