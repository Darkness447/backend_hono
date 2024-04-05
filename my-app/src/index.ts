import { Hono } from 'hono'
import { poweredBy } from "hono/powered-by"
import { logger } from "hono/logger"
import dbConnection from './db/connect'
import FavYoutubeVideosModel, { IFavYoutubeSchema } from './db/fav-youtube-model'

const app = new Hono()

// middlewares
app.use(poweredBy())
app.use(logger())

dbConnection().then(() => {
    // GET List
    app.get("/", async (c) => {
        const document = await FavYoutubeVideosModel.find()
        return c.json(
            document.map(d => d.toObject()),
            200
        )
    })

    // Create document
    app.post("/", async (c) => {
        const formData: IFavYoutubeSchema = await c.req.json()
        if (!formData.thumbnailUrl) delete formData.thumbnailUrl
        
    })

}).catch(err => {
    app.get("/*", (c) => {
        return c.text(`failed to connect with mongo db:${err.message}`)
    })
})

app.onError((err, c) => {
    return c.text(`App Error:${err.message}`)
})

export default app
