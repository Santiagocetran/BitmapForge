import net from 'node:net'
import { once } from 'node:events'

// Deliberately tiny loopback-only FTP peer, not an Internet-facing server.
export async function startFtp(options = {}) {
  const commands = []
  const controlClosures = []
  const sockets = new Set()
  const listeners = new Set()
  let dataConnections = 0
  const track = (socket) => {
    sockets.add(socket)
    socket.on('error', () => {})
    socket.on('close', () => sockets.delete(socket))
    return socket
  }
  const listen = async (server, host = '127.0.0.1') => {
    listeners.add(server)
    server.listen(0, host)
    await once(server, 'listening')
    return server.address().port
  }
  const server = net.createServer((socket) => {
    track(socket)
    controlClosures.push(new Promise((resolve) => socket.once('close', resolve)))
    if (options.multiline) {
      socket.write('220-start\r\n' + ('x'.repeat(1024) + '\r\n').repeat(70))
    } else socket.write('220 Loopback fixture\r\n')
    let buffer = ''
    let data
    let sequence = Promise.resolve()
    const reply = (text) => socket.write(text + '\r\n')
    async function command(line) {
      commands.push(line)
      const [verb] = line.split(' ')
      switch (verb) {
        case 'USER':
          reply('331 Password required')
          break
        case 'PASS':
          reply('230 Logged in')
          break
        case 'FEAT':
          reply('211-Features\r\n MLST type*;size*;modify*;\r\n211 End')
          break
        case 'TYPE':
        case 'STRU':
        case 'OPTS':
          reply('200 OK')
          break
        case 'PWD':
          reply('257 "/"')
          break
        case 'MDTM':
          reply(options.missing ? '550 Missing' : options.fallback ? '502 Unsupported' : '213 20260102030405')
          break
        case 'EPSV':
        case 'PASV': {
          if (verb === 'EPSV' && options.pasv) {
            reply('502 Use PASV')
            break
          }
          data = new Promise((resolve) => {
            const peer = net.createServer((connection) => {
              dataConnections++
              resolve(track(connection))
            })
            listen(peer).then((port) => {
              if (verb === 'EPSV') reply(`229 Entering Extended Passive Mode (|||${port}|)`)
              else
                reply(
                  `227 Entering Passive Mode (${options.separateHost ? '192,0,2,1' : '127,0,0,1'},${port >> 8},${port % 256})`
                )
            })
          })
          break
        }
        case 'MLSD':
        case 'LIST':
        case 'RETR': {
          reply('150 Opening data')
          const connection = await data
          const listing = `${options.proto ? '__proto__=hostile;' : ''}type=file;size=12;modify=20260102030405; file.txt\r\n`
          connection.end(verb === 'RETR' ? 'fixture-data' : listing)
          await once(connection, 'close')
          reply('226 Complete')
          break
        }
        case 'QUIT':
          socket.end('221 Bye\r\n')
          break
        default:
          reply('200 OK')
      }
    }
    socket.on('data', (chunk) => {
      buffer += chunk.toString()
      let end
      while ((end = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, end)
        buffer = buffer.slice(end + 2)
        sequence = sequence.then(() => command(line)).catch(() => socket.destroy())
      }
    })
  })
  const port = await listen(server)
  return {
    port,
    commands,
    waitForControlClose: () => Promise.all(controlClosures),
    get dataConnections() {
      return dataConnections
    },
    async close() {
      for (const socket of sockets) socket.destroy()
      await Promise.all([...listeners].map((listener) => new Promise((resolve) => listener.close(resolve))))
    }
  }
}
