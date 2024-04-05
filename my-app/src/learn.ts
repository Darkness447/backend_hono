import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { streamText, streamSSE, stream } from "hono/streaming"

type VideoType = {
    id: string
    videoName: string
    channelName: string
    Duration: string
}

let videos: VideoType[] = []

const app = new Hono()


app.get("/", (c) => {
    return c.html("<h1>welcome deepesh</h1>")
})

app.post("/videos", async (c) => {
    const { videoName, channelName, Duration } = await c.req.json()
    const newVideo = {
        id: uuidv4(),
        videoName,
        channelName,
        Duration
    }

    videos.push(newVideo)
    return c.json(newVideo)
})

app.get("/videos", (c) => {
    return streamText(c, async (stream) => {
        for (const element of videos) {
            await stream.writeln(JSON.stringify(element))
            await stream.sleep(4000)
        }
    })
})

// Read all data using stream

app.get("/video/:id", (c) => {
    const { id } = c.req.param()
    const video = videos.find((video) => video.id === id);

    if (!video) {
        return c.json(({ message: "Video Not Found" }))
    }
    return c.json(video)
})


// update also

app.put("/video/:id", async (c) => {
    const { id } = c.req.param()
    const index = videos.findIndex((video) => video.id === id)

    if (index === -1) {
        return c.json(({ message: "Video Not Found" }), 404)
    }

    const { videoName, channelName, Duration } = await c.req.json()

    videos[index] = { ...videos[index], videoName, channelName, Duration };

    return c.json(videos[index])
})


// delete the video
app.delete('/video/:id', (c) => {
    const { id } = c.req.param()
    videos = videos.filter((video) => video.id !== id)
    return c.json({ message: "video deleted" })
})

// delete all video

app.delete('/videos', (c) => {
    videos = []
    return c.json({ message: "deleted all videos" })
})


export default app