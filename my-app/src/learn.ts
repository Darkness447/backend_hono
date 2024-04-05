import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";

let videos = []

const app = new Hono()


app.get("/", (c) => {
    return c.html("<h1>welcome deepesh</h1>")
})

app.post("/videos",async (c)=>{
    const {videoName,channelName,Duration} = await c.req.json()
    const newVideo ={
        id:uuidv4(),
        videoName,
        channelName,
        Duration
    }

    videos.push(newVideo)
    return c.json(newVideo)
})

export default app