# RSVP approval + digital access cards (no server, no database)

Everything runs inside the site and on your own phones. Nothing is stored on any server and no outside service is used.

## How it works

1. **Guest RSVPs** on the site. The form prepares a WhatsApp message to the family contact (Okey or Francis). The guest taps Send.
2. **You approve.** Open `https://YOUR-SITE/#/admin` on your phone. Paste the guest's message (the form fills itself), check them against your list, tap **Issue access card**.
3. **Send the card.** Tap **Send on WhatsApp** and the guest receives a personal link.
4. **The guest opens the link** and sees their card (name, unique code, event details) and can save it as an image.

Why it can't be faked: each card is *digitally signed* with a private key that lives only on your phone. The website holds the matching public key and checks the signature when a card is opened. A card that is edited (even one letter of the name) or made by anyone else fails the check and shows nothing. A forwarded RSVP link only creates a WhatsApp request that you can ignore.

## One-time setup (5 minutes)

1. Open `/#/admin` on the phone you will use to approve guests (it must be the https:// site, or localhost).
2. Tap **Create our key**.
3. The page shows a line like `publicKey: {"kty":"EC",...},`. Tap **Copy the line**.
4. In `src/data/site.js`, in the `rsvp` section, replace `publicKey: null,` with that line. Redeploy the site.
5. Go back to `/#/admin`: the banner turns green ("Your site is set up").
6. **Tap Download backup** and keep the file safe (it contains your private key, so don't share it publicly). Open it on your partner's phone with **Restore backup** so both of you can approve guests.

Until step 4 is done, any card link shows "Cards are not switched on yet".

## Day to day

- **Approve a guest:** paste their message, check the name/side/phone, **Issue access card**, **Send on WhatsApp**.
- **Guest who called you:** just type their name and number into the same form.
- **Duplicates:** if a phone number already has a card (any format, e.g. `0803…` / `+234 803…`) you are asked before issuing another.
- **Search / export:** search by name, phone or code; **Download CSV** gives the list for the entrance (the code on a guest's card matches the CSV).
- **Revoke a card:** tap Revoke, then copy the `revoked: [...]` line the page shows into `src/data/site.js` and redeploy. Revocation takes effect after that redeploy (the site has no server to tell instantly).

## Good to know

- Your issued-card list is saved in the browser of the phone you approve on. **Download a backup after each session**, and don't clear that browser's site data. If a phone is lost, restore the backup on another phone. Cards already sent keep working either way, because they are checked by the public key.
- Cards are tied to the key. If you ever create a *new* key, old cards stop verifying, so keep the backup instead.
- Guests must send their RSVP message for it to reach you; there is no automatic inbox. That is the trade-off of having no server.
- Optional: set `publicKey` and `revoked` once and leave them. Nothing else in the site needs changing.

## Files

- `src/lib/cards.js` signing / verifying (WebCrypto ECDSA P-256)
- `src/pages/Rsvp.jsx` guest form → WhatsApp request · `src/pages/Pass.jsx` card · `src/pages/Admin.jsx` your approval page
- `src/data/site.js` → `rsvp.publicKey`, `rsvp.revoked`
