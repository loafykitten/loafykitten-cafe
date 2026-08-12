// Adds the HTTP Range support that Workers static asset serving lacks.
// Only paths listed in run_worker_first (wrangler.jsonc) reach this worker —
// currently /music/*, where browsers stream audio and resume paused downloads
// with Range requests. Without 206 responses, Chrome treats the bogus 200 as
// a network failure: the <audio> element fires 'error' mid-song and an early
// 'ended' at the last buffered byte.

export default {
    async fetch(request, env) {
        const asset = await env.ASSETS.fetch(request)
        if (request.method !== 'GET' || asset.status !== 200) return asset

        const headers = new Headers(asset.headers)
        headers.set('Accept-Ranges', 'bytes')

        const range = request.headers.get('Range')
        if (!range) {
            return new Response(asset.body, { status: 200, headers })
        }

        // Buffered whole (tracks are <10 MB) — asset responses carry no
        // Content-Length, and open-ended/suffix ranges need the total size.
        const full = await asset.arrayBuffer()
        const total = full.byteLength
        const respondFull = () => {
            headers.set('Content-Length', String(total))
            return new Response(full, { status: 200, headers })
        }

        // If-Range: when the validator no longer matches, send the full body.
        // Entity-tag validators compare against ETag, HTTP-date ones against
        // Last-Modified (exact match, per RFC 9110 §13.1.5).
        const ifRange = request.headers.get('If-Range')
        if (ifRange) {
            const etag = asset.headers.get('ETag')
            const lastModified = asset.headers.get('Last-Modified')
            const isEtag = ifRange.startsWith('"') || ifRange.startsWith('W/')
            const matches = isEtag
                ? etag !== null && ifRange.replace(/^W\//, '') === etag.replace(/^W\//, '')
                : lastModified !== null && ifRange === lastModified
            if (!matches) return respondFull()
        }

        // Single byte-range only; for anything else, ignoring Range is allowed.
        const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
        if (!m || (m[1] === '' && m[2] === '')) return respondFull()

        let start
        let end
        if (m[1] === '') {
            // suffix form: bytes=-N (last N bytes)
            start = Math.max(total - Number(m[2]), 0)
            end = total - 1
        } else {
            start = Number(m[1])
            end = m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1)
        }

        if (start >= total || start > end) {
            headers.set('Content-Range', `bytes */${total}`)
            return new Response(null, { status: 416, headers })
        }

        headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
        headers.set('Content-Length', String(end - start + 1))
        return new Response(full.slice(start, end + 1), { status: 206, headers })
    },
}
