// The music page ships with several interchangeable designs.
// Flip `activeDesign` to any id below to switch the live /music page.
// Every design (including inactive ones) is browsable at /music/preview/<id>.

export const musicDesigns = [
    { id: 'voice-memos', label: 'voice memos', blurb: 'late-night recordings straight off the phone' },
    { id: 'shitpost-feed', label: 'shitpost feed', blurb: 'every song is a post, every post is a song' },
    { id: 'burned-cd', label: 'burned cd-r', blurb: 'a sharpie-labeled mixtape made for you' },
    { id: 'scrapbook', label: 'scrapbook', blurb: 'journal pages, tape, and too many feelings' },
    { id: 'zine-flyer', label: 'zine flyer', blurb: 'a xeroxed flyer for a show in someone\'s basement' },
] as const

export type MusicDesignId = (typeof musicDesigns)[number]['id']

export const activeDesign: MusicDesignId = 'voice-memos'
