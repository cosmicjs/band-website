# Band Website
![Band Website](https://cosmicjs.com/uploads/d25aa9d0-b406-11e7-8e44-07c8c7ded69b-band-website.png)
### [View Demo](https://cosmicjs.com/apps/band-website/demo)
### Express + Cosmic JS
This website can be used for any band or musician.  It is built with Express with Mailchimp integrated to handle email signups, and will have all of its data served entirely from Cosmic JS.  Manage content like images, tour dates, videos and more through the [Cosmic JS CMS API Dashboard](https://cosmicjs.com).
### Getting Started
```
git clone https://github.com/cosmicjs/band-website
cd band-website
npm i
```
#### Run in development

```
npm run dev

```

You can easily access content from your Cosmic JS Bucket.
1. [Log in to Cosmic JS](https://cosmicjs.com).
2. Create a Bucket.
3. Go to your Bucket dashboard and find the Settings > Basic Settings menu.
4. Generate keys for Read/Write access for this bucket.
5. Safely store these secrets as env variables to be accessed for local development: `COSMIC_READ_KEY` and `COSMIC_WRITE_KEY`
6. Now when you run `npm run dev` you should see content from your bucket hydrating your views. 

#### Run in production
```
COSMIC_BUCKET=your-bucket-slug npm start
```
Open [http://localhost:3000](http://localhost:3000).

### Cosmic JS
You can easily manage the content in your Band Website on Cosmic JS.  Cosmic JS makes a great [Node.js CMS](https://cosmicjs.com/knowledge-base/nodejs-cms).  Follow these steps:

1. [Log in to Cosmic JS](https://cosmicjs.com).
2. Create a Bucket.
3. Go to Your Bucket > Apps.
4. Install the [Band Website](https://cosmicjs.com/apps/band-website).
5. Deploy your Band website to the Cosmic App Server at Your Bucket > Web Hosting.  Your band mates will be impressed!
