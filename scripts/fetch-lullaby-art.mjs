import fs from "fs";
import path from "path";

const songs = [
  { id: "golden-slumbers", term: "Golden Slumbers The Beatles", pick: (r) => /beatles/i.test(r.artistName) && /golden slumbers/i.test(r.trackName) },
  { id: "stay-awake", term: "Stay Awake Julie Andrews", pick: (r) => /julie andrews/i.test(r.artistName) && /stay awake/i.test(r.trackName) },
  { id: "somewhere-over-the-rainbow", term: "Somewhere Over the Rainbow Israel", pick: (r) => /kamakawiwo|israel/i.test(r.artistName) },
  { id: "hushabye-mountain", term: "Hushabye Mountain Dick Van Dyke", pick: (r) => /hushabye/i.test(r.trackName) },
  { id: "blackbird", term: "Blackbird The Beatles", pick: (r) => /beatles/i.test(r.artistName) && /^blackbird/i.test(r.trackName) },
  { id: "brahms-lullaby", term: "Brahms Lullaby", pick: (r) => /brahms|wiegenlied|lullaby/i.test(r.trackName + " " + (r.collectionName || "")) },
  { id: "mr-blue-sky", term: "Mr. Blue Sky Electric Light Orchestra", pick: (r) => /electric light|elo/i.test(r.artistName) && /blue sky/i.test(r.trackName) },
];

fs.mkdirSync("public/img", { recursive: true });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

for (const song of songs) {
  const file = path.join("public/img", song.id + ".jpg");
  try {
    const url =
      "https://itunes.apple.com/search?term=" + encodeURIComponent(song.term) + "&entity=song&limit=12";
    const res = await fetch(url);
    const data = await res.json();
    const results = data.results || [];
    const hit = results.find(song.pick) || results[0];
    if (!hit?.artworkUrl100) throw new Error("no art");
    const artUrl = hit.artworkUrl100.replace("100x100bb", "600x600bb");
    const img = await fetch(artUrl);
    const buf = Buffer.from(await img.arrayBuffer());
    fs.writeFileSync(file, buf);
    console.log("OK", song.id, "->", hit.trackName, "|", hit.artistName, buf.length);
  } catch (e) {
    console.log("FAIL", song.id, e.message);
  }
}
