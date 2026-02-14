export interface Env {
  CLOUD_NAME?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Optie: als query param 'u' is gezet -> proxieer die volledige URL (handig voor testen)
    const fullUrl = url.searchParams.get("u");
    if (fullUrl) {
      try {
        const resp = await fetch(fullUrl);
        if (!resp.ok) {
          return new Response(`Upstream not found: ${fullUrl}`, {
            status: resp.status,
          });
        }
        const newResponse = new Response(resp.body, resp);
        newResponse.headers.set(
          "Cache-Control",
          "public, max-age=31536000, immutable",
        );
        newResponse.headers.set("X-Image-Proxy", "Direct-proxy");
        newResponse.headers.set("Access-Control-Allow-Origin", "*");
        return newResponse;
      } catch (err) {
        return new Response(`Error fetching URL: ${err}`, { status: 500 });
      }
    }

    // Standaard Cloudinary flow
    const CLOUD_NAME = env.CLOUD_NAME || "YOUR-CLOUD-NAME";
    const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload`;

    const imagePath = url.pathname; // b.v. /sample.jpg of /v168.../sample.jpg

    // direct na: const imagePath = url.pathname;
    if (imagePath.startsWith("/.well-known")) {
      return new Response("Not proxied: .well-known path", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    if (!imagePath || imagePath === "/") {
      return new Response(
        "No image path provided. Use /<public_id>.jpg or ?u=<full_image_url> to test.",
        {
          status: 400,
          headers: { "Content-Type": "text/plain" },
        },
      );
    }

    const width = url.searchParams.get("w");
    const height = url.searchParams.get("h");
    const quality = url.searchParams.get("q") || "auto";

    const transforms: string[] = ["f_auto", `q_${quality}`];
    if (width) transforms.push(`w_${width}`);
    if (height) transforms.push(`h_${height}`);

    const transformString = transforms.join(",");
    const cloudinaryUrl = `${BASE_URL}/${transformString}${imagePath}`;

    console.log(`Image proxy: ${url.href} → ${cloudinaryUrl}`);

    try {
      const resp = await fetch(cloudinaryUrl);
      if (!resp.ok) {
        return new Response(`Image not found: ${imagePath}`, {
          status: resp.status,
          headers: { "Content-Type": "text/plain" },
        });
      }
      const newResponse = new Response(resp.body, resp);
      newResponse.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable",
      );
      newResponse.headers.set("X-Image-Proxy", "Cloudflare + Cloudinary");
      newResponse.headers.set("Access-Control-Allow-Origin", "*");
      return newResponse;
    } catch (err) {
      console.error("Image proxy error:", err);
      return new Response(`Error fetching image: ${err}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  },
};
