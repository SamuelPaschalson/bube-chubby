/**
 * ============================================================
 *  BUBE & CHUBBY — SINGLE SOURCE OF TRUTH
 *  Chimdiebube Precious  &  Chukwuebuka Edward
 * ============================================================
 *  Every name, date, venue, phone number and photo path used on the
 *  site lives in this one file. Edit it and the whole site updates —
 *  no other file needs touching.
 *
 *  Search for  TODO:  to find everything still waiting on the couple.
 * ============================================================
 */
export const SITE = {
  couple: {
    bride: 'Chimdiebube Precious',
    groom: 'Chukwuebuka Edward',
    brideShort: 'Precious',
    groomShort: 'Edward',
    nickname: 'Bube & Chubby', // printed under the monogram on the invitation
    hashtag: '#BC2027',
  },

  // Used by the countdown. Ceremony: 12 noon prompt, West Africa Time.
  dateISO: '2027-01-02T12:00:00+01:00',
  date: {
    weekday: 'Saturday',
    long: 'Saturday, 2nd January 2027',
    short: '2nd January 2027',
    numeric: '02 · 01 · 2027',
    time: '12 noon prompt',
    city: 'Awka, Anambra State',
  },

  families: [
    {
      names: 'Mr Francis & Mrs Uche Agbazue',
      from: 'Umuokwu Village, Alor, Anambra State',
    },
    {
      names: 'Chief Sir Okey (Ijelenze) & Lady Stella (Iyom Mmasinachi) Ezepue',
      from: 'Umualocha Umudunu Village, Abagana, Anambra State',
    },
  ],

  events: [
    {
      id: 'ceremony',
      label: 'The Vows',
      title: 'Wedding Ceremony',
      time: '12 noon prompt',
      venue: 'St Thomas Aquinas Catholic Church',
      address: 'Awka, Anambra State',
      note: 'Please be seated before 12 noon. The ceremony begins promptly.',
      map: 'https://www.google.com/maps/search/?api=1&query=St+Thomas+Aquinas+Catholic+Church+Awka+Anambra',
    },
    {
      id: 'reception',
      label: 'The Celebration',
      title: 'Reception',
      time: '3:00 pm',
      venue: 'Annabel Event Center',
      address: 'Awka, Anambra State',
      note: 'Doors open for the reception at 3:00 pm. This is an adults-only celebration.',
      map: 'https://www.google.com/maps/search/?api=1&query=Annabel+Event+Center+Awka+Anambra',
    },
  ],

  // The wedding is an adults-only celebration: no children's party.
  adultsOnly: true,
  adultsNote:
    'This is an adults-only celebration. With love, we are unable to accommodate children at the ceremony or the reception.',

  // Colours of the day, as printed on the invitation.
  palette: [
    { name: 'Champagne', hex: '#ecd3b2' },
    { name: 'Rose Gold', hex: '#e8b4b0' },
    { name: 'Vintage Mauve', hex: '#b27f84' },
  ],

  // Who to call / RSVP to. `wa` is the number in international format, no "+".
  contacts: [
    {
      name: 'Okey',
      role: 'Ezepue family',
      display: '0803 598 4116',
      tel: '+2348035984116',
      wa: '2348035984116',
    },
    {
      name: 'Francis',
      role: 'Agbazue family',
      display: '0802 314 9199',
      tel: '+2348023149199',
      wa: '2348023149199',
    },
  ],

  /**
   * RSVP — same architecture as the Amanda & Nnanyelugo site:
   *   RsvpServiceProvider → createRsvpService() → [ /api/rsvp  →  Google Form
   *   (direct)  →  localStorage ], so a reply is never lost.
   * Replies are written to the "Bube and Chubby 2027" Google Form / Sheet.
   * If that is unreachable they are kept in the guest's browser as a last resort.
   */
  rsvp: {
    deadline: '', // TODO: e.g. '30 November 2026' (leave empty to hide)
    // Every guest replies for themselves: one RSVP = one seat.
    form: {
      // "Bube and Chubby 2027" Google Form (responses land in its Sheet).
      action:
        'https://docs.google.com/forms/d/e/1FAIpQLScfYRWaazHXNNrCgxzh09nSy4GZOSLgNg59S2A00-xmzyOJrA/formResponse',
      fields: {
        name: 'entry.786368817',
        attending: 'entry.1304438325',
        guestOf: 'entry.1422033785',
        seats: 'entry.1799623948',
        phone: 'entry.820982805',
        email: 'entry.1876165105',
        comments: 'entry.157814929',
      },
      // Option text must match the Google Form exactly.
      attendingOptions: { yes: 'Yes', no: 'No' },
      guestOfOptions: ['Grooms family', 'Brides family', 'Friends'],
    },
  },

  /**
   * Music. Drop the couple's song into the site folder as  song.mp3  and it
   * starts when the guest opens the envelope. If the file is missing, the
   * music button simply hides itself.
   */
  song: 'song.mp3',

  // The printed invitation card, shown on The Wedding Day page.
  invitation: 'images/invitation.jpg',

  // Hero + page photographs (engagement session, F10 Studio, 20 Sept 2026).
  photos: {
    hero: 'images/eng-11',
    story: ['images/eng-01', 'images/eng-12'],
    day: 'images/eng-07',
    people: 'images/eng-06',
    guide: 'images/eng-02',
    rsvp: 'images/eng-09',
  },

  gallery: [
    {
      src: 'images/eng-10',
      alt: 'Precious and Edward facing the camera, hands joined',
    },
    { src: 'images/eng-02', alt: 'Precious and Edward on a stone balustrade' },
    { src: 'images/eng-01', alt: 'A close, tender portrait of the couple' },
    {
      src: 'images/eng-07',
      alt: 'The couple standing together on a garden path',
    },
    { src: 'images/eng-03', alt: 'Precious framed by a carved stone archway' },
    { src: 'images/eng-09', alt: 'The couple laughing together' },
    { src: 'images/eng-11', alt: 'Her engagement ring, resting on his cheek' },
    { src: 'images/eng-08', alt: 'Walking hand in hand across the lawn' },
    { src: 'images/eng-05', alt: 'Together against a red-brick wall' },
    { src: 'images/eng-04', alt: 'Edward seated on the balustrade' },
    {
      src: 'images/eng-06',
      alt: 'Precious seated, Edward standing, in front of the brick wall',
    },
    { src: 'images/eng-12', alt: 'The couple beneath the stone arches' },
  ],

  /* ---------------------------------------------------------- */
  /*  OUR PEOPLE                                                 */
  /* ---------------------------------------------------------- */
  // TODO: new portraits for Amanda, Nnenna, Ogo and Oma. Add them as they arrive:
  //   photos: ['images/party-bridesmaid-name.jpg']  (an empty list shows "Portrait coming soon")
  // Cards with two photos flip on tap.
  bridesmaids: [
    {
      name: 'Ify',
      role: 'Chief Bridesmaid',
      photos: ['images/party-bridesmaid-ify.jpg'],
      focus: '50% 22%',
    },
    {
      name: 'Amanda',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-amanda.jpg'],
      focus: '50% 62%',
    },
    {
      name: 'Favour',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-favour.jpg'],
      focus: '30% 40%',
    },
    {
      name: 'Kenny',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-kenny.jpg'],
      focus: '52% 26%',
    },
    {
      name: 'Nnenna',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-nnenna.jpg'],
      focus: '60% 30%',
    },
    {
      name: 'Ogo',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-ogo.jpg'],
      focus: '52% 28%',
    },
    {
      name: 'Oma',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-oma.jpg'],
      focus: '52% 30%',
    },
    {
      name: 'Onyi',
      role: 'Bridesmaid',
      photos: ['images/party-bridesmaid-onyi.jpg'],
      focus: '50% 28%',
    },
  ],

  groomsmen: [
    {
      name: 'Zaiki',
      role: 'Best Man',
      photos: ['images/party-groomsman-zaiki.jpg'],
      focus: '50% 40%',
    },
    {
      name: 'Nedu',
      role: 'Groomsman',
      photos: ['images/party-groomsman-nedu-1.jpg'],
      focus: '50% 42%',
    },
    {
      name: 'Blosomart',
      role: 'Groomsman',
      photos: ['images/party-groomsman-blosomart.jpg'],
      focus: '55% 38%',
    },
    {
      name: 'AVB',
      role: 'Groomsman',
      photos: ['images/party-groomsman-avb.jpg'],
      focus: '50% 30%',
    },
    {
      name: 'Leschar',
      role: 'Groomsman',
      photos: ['images/party-groomsman-leschar.jpg'],
      focus: '45% 38%',
    },
    {
      name: 'Optimistic',
      role: 'Groomsman',
      photos: ['images/party-groomsman-optimistic.jpg'],
      focus: '45% 50%',
    },
  ],

  /* ---------------------------------------------------------- */
  /*  OUR STORY                                                  */
  /* ---------------------------------------------------------- */
  // TODO: the couple's own words. Add chapters and the Story page fills in:
  //   { kicker: 'How we met', body: 'First paragraph.\n\nSecond paragraph.' }
  story: {
    title: 'The Girl I Found on Instagram ❤️',
    author: 'Chubby',
    chapters: [
      {
        kicker: 'A video, a feeling',
        body: `Some love stories begin with a conversation. Others begin with a chance encounter. Mine began with a video, an unexpected feeling, and a decision that would change my life forever.

One ordinary day, while scrolling through Instagram, I came across a video of a beautiful woman at a wedding party with her friend. I didn’t know her name, her story, or anything about the person she was. But as I watched that video, something inside me whispered, This is going to be my wife.

I know how unbelievable that sounds. How could a man look at a woman he had never met and imagine a future with her? Yet, somehow, that was exactly what happened.

Determined to find her, I went from her friend’s page to hers, searching until I finally found the woman who had captured my attention. I sent her a message, we began talking, and soon our conversations moved to WhatsApp. Within a few days, a stranger on Instagram had become someone I genuinely wanted to know.`,
      },
      {
        kicker: 'An ocean apart',
        body: `There was just one problem: I was in Canada, and she was in Nigeria, separated from me by thousands of miles and an ocean. But the more we talked, the more I wanted to meet her in person. I needed to know if the woman I had seen on my screen was the same woman I would connect with in real life. I wanted to discover whether what I was feeling was real.

So, within one week of talking to her, I booked a flight to Nigeria.

I told nobody. It was a secret journey, a decision I made quietly, driven by a feeling I couldn’t fully explain.`,
      },
      {
        kicker: 'Four nights in Abuja',
        body: `Then came Abuja. Four nights. That was all I had to turn a digital connection into something real. I travelled across continents to meet a woman I had only recently discovered, hoping to confirm what my heart seemed to know already. And somehow, those four nights became the beginning of something far more beautiful than I had imagined.

When I had to return to Canada for work, the flight back felt like the longest of my life. I was leaving behind a feeling I didn’t want to lose, memories I wanted to hold on to, and a woman I suddenly had every reason to see again. Yet, despite the distance, I returned feeling refreshed and grateful. I had travelled to Nigeria with a question, and I came back with something worth travelling for.`,
      },
      {
        kicker: 'Four journeys',
        body: `Our relationship grew from there, bringing beautiful moments, unexpected challenges, lessons, and experiences that taught us what it truly meant to choose each other. A few months later, I returned to Nigeria to see her again. Then, a few months after that, I came back once more. In total, I travelled four times within a single year.

Four journeys across continents, all for the same woman.

I wanted to experience us beyond phone calls and messages. I wanted to sit beside her, share ordinary moments, laugh with her, and discover the little things that distance could never fully reveal. I wanted to be sure that what we felt when we were apart was just as real when we were together.

And with every visit, I found more reasons to be grateful that I had taken that first step.`,
      },
      {
        kicker: 'Worth every mile',
        body: `She was so much more than the beautiful woman in that wedding video. I discovered her kind heart, her beautiful personality, and the little things that made her who she was. The more I got to know her, the more I realised that the woman I had been so determined to meet was someone I wanted to build a future with.

If life gave me the opportunity to go back to that first day, knowing everything I know now, I would do it all again. I would search for her, send that first message, book that flight, and take every journey a hundred times over, because she was worth every mile.`,
      },
      {
        kicker: 'The final stretch',
        body: `And now, here we are, approaching the final stretch of a journey that began with a video on Instagram and a thought that seemed almost impossible at the time: This is going to be my wife.

Soon, there will be no more counting down the days until the next visit, no more painful goodbyes at airports, and no more oceans separating us. Soon, I will stand before the woman I once travelled across continents just to meet, hold her hand, and make a promise to love her for the rest of my life.

Sometimes, I think about how easily our story could have been different. I could have scrolled past that video. I could have admired her for a moment and carried on with my day. I could have convinced myself that travelling across the world to meet someone I had only just started talking to was too much.

But I didn’t scroll past.

I sent the message. I booked the flight. And one decision led to another until the woman I had once seen on a screen became the woman I cannot wait to call my wife.

I thought I was booking a flight to meet a beautiful woman. I didn’t know I was taking the first step towards the rest of my life.

And soon, the girl I found on Instagram will become the woman I get to call my wife. ❤️💍`,
      },
    ],
    pullquote:
      'I thought I was booking a flight to meet a beautiful woman. I didn’t know I was taking the first step towards the rest of my life.',
    // Baby-to-adult photo transition: each frame dissolves from `baby` to `now`.
    // `babyFocus` / `nowFocus` keep the face in frame when the photo is cropped.
    thenNow: [
      {
        who: 'Precious',
        baby: 'images/then-bride.jpg',
        babyFocus: '50% 34%',
        now: 'images/eng-03-800.jpg',
        nowFocus: '50% 50%',
      },
      {
        who: 'Edward',
        baby: 'images/then-groom.jpg',
        babyFocus: '50% 30%',
        now: 'images/eng-04-800.jpg',
        nowFocus: '50% 40%',
      },
    ],
    milestones: [
      {
        date: '20 September 2026',
        title: 'The engagement session',
        text: 'A golden afternoon with F10 Studio — the photographs you see throughout this site.',
      },
      {
        date: '2 January 2027',
        title: 'The wedding day',
        text: 'St Thomas Aquinas Catholic Church, Awka, at 12 noon prompt, with the reception following at 3:00 pm at Annabel Event Center.',
      },
    ],
  },

  faqs: [
    {
      q: 'What time should I arrive?',
      a: 'The ceremony starts at 12 noon prompt at St Thomas Aquinas Catholic Church, Awka. Please be seated a little before, so that we can begin on time.',
    },
    {
      q: 'Where is the reception?',
      a: 'At Annabel Event Center, Awka. The reception begins at 3:00 pm.',
    },
    {
      q: 'Are children welcome?',
      a: "We love your little ones, but this is an adults-only celebration, with no children's party. Thank you for understanding and for arranging a sitter for the day.",
    },
    {
      q: 'What are the colours of the day?',
      a: 'Champagne, Rose Gold and Vintage Mauve. You will find the swatches on the home page. We would love to see you in them.',
    },
    {
      q: 'How do I RSVP?',
      a: 'Use the RSVP page on this site, or call either of the family contacts listed below. Every guest replies individually, so if you are coming with someone, ask them to send their own RSVP.',
    },
    {
      q: 'I am travelling in. What should I know?',
      a: 'Both the church and the reception are in Awka, the capital of Anambra State, so you can settle in one place. If you are flying, ask the family contacts for the easiest route from your city and for arrival tips on the day.',
    },
    {
      q: 'Is there parking?',
      a: 'Yes. There is enough parking space for everybody at both the church and the reception, so drive in and park.',
    },
    {
      q: 'Can I take photos?',
      a: 'Yes, please do! Take as many as you like at the ceremony and the reception. We only ask that you keep the aisle clear for our photographers.',
    },
    {
      q: 'Where do I post them?',
      a: 'Tag #BC2027 so we can find every last one.',
    },
  ],
};
export default SITE;
