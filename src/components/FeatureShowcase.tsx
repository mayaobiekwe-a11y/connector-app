import Image from "next/image";

const FEATURES = [
  {
    title: "Ask like you'd text a friend",
    body: "No forms, no filters, no keyword search. Type what you need in plain language and Mobi takes it from there.",
    image: "/screenshots/ask.png",
    width: 1100,
    height: 315,
  },
  {
    title: "Mobi finds the right person",
    body: "Your ask gets read, not just matched on keywords. Mobi considers who's actually in the network and why they're a fit, then tells you.",
    image: "/screenshots/match.png",
    width: 740,
    height: 525,
  },
  {
    title: "Coordinate in a simple thread",
    body: "Once someone's in, you talk it out right there on Mobi. No email back-and-forth, no losing the context of why you're even talking.",
    image: "/screenshots/thread.png",
    width: 740,
    height: 665,
  },
  {
    title: "Build a real track record",
    body: "Showing up and following through earns reputation that compounds. The more you help, the more Mobi prioritizes you for what's next.",
    image: "/screenshots/trust.png",
    width: 740,
    height: 455,
  },
];

export default function FeatureShowcase() {
  return (
    <div className="mt-20 space-y-16">
      <h2 className="text-center text-3xl font-bold text-gray-900">What it actually looks like</h2>
      {FEATURES.map((f, i) => (
        <div
          key={f.title}
          className={`flex flex-col ${i % 2 === 1 ? "md:flex-row-reverse" : "md:flex-row"} items-center gap-8 md:gap-12`}
        >
          <div className="flex-1 w-full">
            <div className="card overflow-hidden">
              <Image
                src={f.image}
                alt={f.title}
                width={f.width}
                height={f.height}
                className="w-full h-auto"
              />
            </div>
          </div>
          <div className="flex-1 w-full max-w-md md:max-w-none">
            <h3 className="text-2xl font-bold text-gray-900">{f.title}</h3>
            <p className="mt-3 text-gray-600 text-lg">{f.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
