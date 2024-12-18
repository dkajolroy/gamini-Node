const express = require("express");
const app = express();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs");
app.use(express.json());

const imageSix = Buffer.from(fs.readFileSync("images/bird.jpeg")).toString(
  "base64"
);
// Gobal variable
const PORT = 3000;
const API_KEY = " ";
const image = {
  inlineData: {
    data: imageSix,
    mimeType: "image/jpeg",
  },
};

const prompt = `
  Give me SEO title minimum 6 word and up to [150] character without any symbol, 
  SEO description up to [300] character and 
  SEO tags single word, small letter and number of [20}] tags from this image. 
  But the result only title, description and tags without any other text  or other suggestions. 
  Don't use [free] word and don't use colon mark. 
  Information type [silhouette vector, vector art or normal photos ] related but detect you automatically. 
  Image type [icon, design, art, illustration or normal photos] detect you automatically 
  If you detect image object is vector illustration with only black color object, so please use silhouette word in the title and description in any position.
  If you detect image object is vector illustration with multi color, so don't use silhouette word in the title and description
  `;
app.get("/", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([prompt, image]);

    // const text = `Here's a possible SEO optimization for an image of an adorable cat:\n\n**Title:** Adorable Scottish Fold Kitten with Striking Eyes\n\n**Description:**  A captivating close-up of a charming Scottish Fold kitten. Its large, expressive amber eyes and soft, tabby markings make for an irresistible image. Perfect for cat lovers and anyone who appreciates adorable animals.\n\n**Tags:** Scottish Fold, kitten, cat, cute, adorable, amber eyes, tabby, pets, animals, fluffy, feline, kitty,  pet photography, animal photography\n\n\n**SEO Title:** Adorable Scottish Fold Kitten with Striking Eyes\n\n**SEO Description:** A captivating close-up of a charming Scottish Fold kitten. Its large, expressive amber eyes and soft, tabby markings make for an irresistible image. Perfect for cat lovers and anyone who appreciates adorable animals.\n\n**SEO Tags:** Scottish Fold, kitten, cat, cute, adorable, amber eyes, tabby, pets, animals, fluffy, feline, kitty,  pet photography, animal photography\n`;
    const splitRes = result.response.text().split("\n\n");
    const title = splitRes[0].split("**Title:**")[1].trim();
    const description = splitRes[1].split("**Description:**")[1].trim();
    const tags = splitRes[2].split("**Tags:**")[1].trim();
    const data = { title, description, tags };

    res.send({
      msg: "Send to Love",
      data: data,
    });
  } catch (error) {
    res.send({
      msg: "Something want to wrong !",
    });
  }
});
const images = [
  "images/bee1.jpg",
  "images/bee1.jpg",
  "images/bee1.jpg",
  "images/bee1.jpg",
  "images/bee1.jpg",
];
app.get("/multi", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent([
      ...images.map((x) => {
        return {
          inlineData: {
            data: Buffer.from(fs.readFileSync(x)).toString("base64"),
            mimeType: "image/*",
          },
        };
      }),
      `
      Generate a JSON array without variables. Object key is title, description and tags. 
      Detect image one by one and fill up titles, descriptions and tags SEO friendly.
      Sent you a total of ${images.length} images, all image data must be provided.
      Title must be more than 8 words but Don't use [free] word and don't use colon mark. 
      Do not generate old title again but with slight changes. 
      Total 25 SEO tags must be single words and lowercase letters.

      Detect image type (transparent, vector, illustration, raster, art ) And Image object (position, situation, capture mode, quality ) etc.
      If you detect image object is black and if it is illustration file so please use silhouette word in the title description.
      If you detect image object is no black, so don't use silhouette word in the title and description.

      Give me only json data without any other information or suggestions. 
      `,
    ]);

    const extractResult = result.response
      .text()
      .split("```")[1]
      .split("json")[1];
    const data = JSON.parse(extractResult);
    return res.send(data);
  } catch (error) {
    res.send({
      msg: "Something want to wrong !",
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server run on ${PORT}`);
});
