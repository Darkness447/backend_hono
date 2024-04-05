import { Hono } from 'hono'
import { poweredBy } from "hono/powered-by"
import { logger } from "hono/logger"
import dbConnection from './db/connect'
import FavYoutubeVideosModel, { IFavYoutubeSchema } from './db/fav-youtube-model'
import { streamText, streamSSE, stream } from "hono/streaming"
import { isValidObjectId } from 'mongoose'

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
        const formData = await c.req.json()
        if (!formData.thumbnailUrl) delete formData.thumbnailUrl

        const FavYoutubeVideosObject = new FavYoutubeVideosModel(formData)

        try {
            const document = await FavYoutubeVideosObject.save()
            return c.json(document.toObject(), 201);
        }
        catch (error) {
            return c.json((error as any)?.message || "Internal server Error", 500)
        }

    })

    // View document By Id
    app.get("/:documentId", async (c) => {
        const id = c.req.param("documentId")
        if (!isValidObjectId(id)) return c.json("Invalid ID", 400)


        const document = await FavYoutubeVideosModel.findById(id)

        if (!document) return c.json("Document not Found", 404)

        return c.json(document.toObject(), 200)
    })


    app.get("/d/:documentId", async (c) => {
        const id = c.req.param("documentId")
        if (!isValidObjectId(id)) return c.json("Invalid ID", 400)


        const document = await FavYoutubeVideosModel.findById(id)

        if (!document) return c.json("Document not Found", 404)

        return streamText(c, async (stream) => {
            stream.onAbort(() => {
                console.log("Aborted")
            })

            for (let i = 0; i < document.description.length; i++) {
                await stream.write(document.description[i])
                await stream.sleep(4000)
            }
        })

    })


    app.patch("/:documentId", async (c) => {
        const id = c.req.param("documentId")
        if (!isValidObjectId(id)) return c.json("Invalid ID", 400)


        const document = await FavYoutubeVideosModel.findById(id)

        if (!document) return c.json("Document not Found", 404)

        const formData: IFavYoutubeSchema = await c.req.json()

        if (!formData.thumbnailUrl) {
            delete formData.thumbnailUrl
        }
        try {
            const updatedDocument = await FavYoutubeVideosModel.findByIdAndUpdate(
                id,
                formData,
                {
                    new: true
                }
            )

            return c.json(updatedDocument?.toObject(), 200)
        } catch (error) {

        }
    })

    app.delete("/:documentId", async (c) => {
        const id = c.req.param("documentId")
        if (!isValidObjectId(id)) return c.json("Invalid ID", 400)

        try {
            const document = await FavYoutubeVideosModel.findByIdAndDelete(id)
            return c.json(document?.toObject(), 200)
        } catch (error) {
            console.error(error)
            return c.json("error", 500)
        }
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
