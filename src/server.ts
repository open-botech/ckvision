import express, { Request, Response } from 'express'
import serveStatic from 'serve-static'
import path from 'path'
import fs from 'fs'
import { parse } from 'node-html-parser'

const app = express()

function cacheMiddleware(req: Request, res: Response, next: Function) {
  res.setHeader('Cache-Control', 'public, max-age=86400')
  next()
}

function serveIndex(req: Request, res: Response) {
  const url = process.env.CONNECTION_URL
  const user = process.env.CONNECTION_USER
  const pass = process.env.CONNECTION_PASS
  const html = fs.readFileSync(path.join('click-cat', 'index.html'), 'utf-8')
  const root = parse(html.toString())
  const script = root.querySelector('script')
  script?.insertAdjacentHTML(
    'beforeend',
    `
  localStorage.setItem('previousConnection', JSON.stringify({"previousConnection":{"connectionName":"sonic","connectionUrl":"${url}","username":"${user}","password":"${pass}","params":""}}));
  localStorage.setItem('connection', JSON.stringify({"connection":{"connectionName":"sonic","connectionUrl":"${url}","username":"${user}","password":"${pass}","params":""}}));
  `,
  )

  const content = root.toString()
  res.send(content)
}

app.get('/cluster-info', (req, res) => {
  res.json(JSON.parse(process.env.CLUSTER_INFO as string))
})

app.get('/', serveIndex)

app.use(cacheMiddleware, serveStatic(path.join('click-cat')))

app.get('/*', serveIndex)

app.listen(8080)
